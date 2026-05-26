import { BlogPosts } from "app/components/posts";
import { ProjectPosts } from "./components/projects";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Tony Oliverio
      </h1>
      <p className="mb-4">{`Full-stack engineer mostly focused on backend. <3 distributed systems, infra, OTel`}</p>
      <p className="mb-2">
        {`Current: co-founder + CTO at `}
        <a href="https://trycasa.com">Casa</a>
      </p>
      <p className="mb-4">
        {`Prev: Payments @ Check, Founding Engineer @ Turnstile`}
      </p>
      <div className="my-8 text-2xl">{`Projects`}</div>
      <div className="my-8">
        <ProjectPosts />
      </div>
      <div className="my-8 text-2xl">{`Blogs`}</div>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  );
}
