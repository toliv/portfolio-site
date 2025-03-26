---
title: "Why AWS Service Connect May Not Be Your Friend for SSE: A Debugging Adventure"
publishedAt: "2025-04-01"
summary: "Debugging and solving a tough networking problem with ECS"
---

## Background

Recently I spent probably 3 days identifying and finally resolving a non-obvious networking challenge. To me, the results pretty surprising and I figure that perhaps someone in a similar situation could benefit from some of this knowledge.

The goal: support a long-running server endpoint performing OCR analysis on lengthy PDF documents.

## Infrastructure setup

Our infrastructure involves AWS ECS running FastAPI apps via uvicorn, behind an AWS ALB, and Cloudflare for DNS and proxy:

```
Cloudflare DNS/Proxy → AWS ALB → AWS Service Connect → ECS Task (FastAPI)
```

## Initial HTTP Request Approach

My first go-at-it was fairly naive. I just made a simple HTTP request and waited for the response (about 45 seconds). In my local environment, this worked flawlessly. My server chugged away, processed the document, then finally returned a `200 OK` response.

Once I got to production, however, I got a totally different result. After about only 30 seconds, I was met with a `504 Gateway Timeout` error.

Initially suspecting Cloudflare's idle connection timeout, I decided to transition from a long-running HTTP request to a more responsive solution.

## Using SSE (Server-Sent Events)

Using OpenAI's streaming API was the first time I encountered the SSE protocol. It's a pretty simple protocol which uses `Content-Type: text/event-stream` and sends UTF-8 encoded text. Messages are designated with `\n\n\` So you might see some stream of messages like

```
id: 1\n
event: connection\n
data: "Connected to the SSE stream."\n
\n
id: 2\n
event: chat\n
data: {"sender": "Alice", "message": "Hello, world!"}\n
\n
id: 3\n
event: chat\n
data: {"sender": "Bob", "message": "Hi Alice, how are you?"}\n
\n
id: 4\n
event: chat\n
data: {"sender": "Alice", "message": "I'm doing well, thanks!"}\n
\n
```

As I had seen some success with it before, I was happy to give it a go for my own endpoint.

I replaced my long-running API request with an SSE request which sent a periodic (5 second) heartbeat.
My local environment worked like a charm but when I went live to production, I got a slightly different timeout error after 15 seconds 🤔, something like `ERR_SOCK_CLOSED`. Nothing in my API logs indicated the request failed so now I was really confused. What could have been causing this issue?

## Narrowing Down the Issue

Since my React / NextJs app was making the API call to my server, I wanted to make sure that it wasn't part of the problem, so I used `curl` to hit the same API route and validate that I saw the same behavior. Using `curl -v` showed the exact same behavior - the connection was prematurely terminated after 15 seconds. Just for kicks, I forced an `HTTP/1.1` connection to discount any `HTTP/2` related issues, and confirmed that `HTTP/2` was not causing an issue.

In addition, I wanted to completely discount any Cloudflare monkey business so I bypassed my external DNS name (`api.*.com`) in favor of directly connecting to my load balancer using its internal DNS name. This confirmed that indeed, Cloudflare was not the issue either.

## Diving Deeper: Possible Timeout Culprits

At this point I had a couple hypotheses I thought were worth pursuing.

1. **Uvicorn idle timeout setting** : If the uvicorn idle connection timeout was too low, perhaps the "jittery" nature of an async timer to send heartbeats was barely exceeding the limit and causing the issue.

There were two small tweaks I tried to quickly validate that an odd uvicorn setting wasn't at play.

- Increase the heartbeat frequency to 1s
- Increase uvicorn's `--timeout-keep-alive 30` from the default of 5 seconds

In retrospect, I do think that these were impactful and necessary changes. In the original single long-running HTTP request setup, we were certainly exceeding the keep alive timeout and would have needed to tweak this.

However, in the SSE setup, changing either of these parameters did not result in the issue going away in production!

2. **AWS application load balancer setting**: If the load balancer had too low of an idle connection timeout, perhaps it was prematurely terminating the connection.

Looking at the AWS ALB settings I noticed the idle connection timeout was set to 60 seconds. Just for kicks, I bumped it to 90 seconds but as expected, no change there.

## Simplifying the equation

Just to fully dismiss any sort of question surrounding my application (endpoint) logic, I created a new endpoint which specifically only sent a 1s heartbeat for 60 seconds.

```
@router.get("/public/test-sse")
async def test_sse(
):
    async def heartbeat_generator():
        for i in range(30):
            yield "data: heartbeat\n\n"
            await asyncio.sleep(2)

    return StreamingResponse(heartbeat_generator(), media_type="text/event-stream")
```

After deploying to production I confirmed the same behavior occurred on this endpoint too.

## The Real Culprit: AWS Service Connect

AWS Service Connect is meant to simplify task-to-task communication in an ECS cluster by providing a simpler DNS name and therefore lower latency connection.

For example, as opposed to making a request to my API server like

```
await fetch("https://api.*.com/public/test-sse)
```

I can simply do

```
await fetch("http://apisvc:8000/public/test-sse)
```

What I didn't fully understand was that AWS Service Connect had its **own** set of timeouts as well, and ... tada 🎉 it had a 15 second idle connection timeout.

But now I'm confused... the connection **isn't idle**, we're sending a heartbeat message every 1 second!

Bumping the idle connection timeout higher, like clockwork, the request timed out after that amount of time. So I was pretty confident that the problem resided here.

## Comparing SSE with WebSockets

Now I was really confused, because I have a lot of other logic in my server that uses websockets, and despite using heartbeats, in certain situations they certainly sit connected longer than 15 seconds at times. **Why would a websocket connection differ significantly from an SSE connection wrt idle timeout?**

Once again, I went back to create a trivial websocket endpoint to compare against

```
@router.websocket("/public/ws/test")
async def websocket_test(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Send a heartbeat message every 2 seconds.
            await websocket.send_text("heartbeat")
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print("Client disconnected")
```

To my surprise (or I guess, not quite a huge surprise based on past results), the websocket endpoint didn't time out!

## Conclusion & Recommendation

Despite no clear AWS documentation around this behavior, my tests conclusively demonstrated:

**AWS Service Connect fails to properly reset idle timeouts for SSE connections, unlike WebSockets.**

My simple resolution was to just use a websocket instead of an SSE route. Not exactly the most straightforward path but one I'm glad to have found.

## Lessons Learned

In retrospect I wish I would have built the toy endpoints a bit quicker. I think they ultimately allowed me to more quickly iterate and try to tweak the setup. Additionally, I think if I took a slightly more systematic approach to analyze the system (pop one piece out, pop it back in etc) it may have helped me. Although practically I honestly don't think I would have looked at Service Connect too quickly.
