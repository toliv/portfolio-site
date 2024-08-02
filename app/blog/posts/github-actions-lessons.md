---
title: "Github Actions lessons learned the hard way"
publishedAt: "2024-08-02"
summary: "Subtleties and Gotcha's when working with Github Actions: LARPing as a devops engineer"
---

## Overview

Here are a few short tips and lessons I've learned while working on Github Actions (or how I learned to LARP as a devops engineer).

The following are things small and large I've learned, re-learned, and re-re-learned working with Github Actions.

Many of these were learned during a big undertaking to enable basic continuous deploys in a prior role. I'll share the full details on that in another post, but I think these are interesting and useful even out of that context.

I'll assume the reader has a basic understanding of a [Merge Queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue).

Without going too far into detail, a merge queue allows for serialized commits onto the default branch, avoiding some kinds of conflicting code more likely with multiple engineers on a monorepo.

Commonly this looks like

- create a Pull Request
- status checks run (typecheck, units, etc)
- Add the PR to the Merge Queue
- Additional checks run on the PR in the Merge Queue
- Once verified, PR is squashed and committed onto the default branch

## Required Status Checks

Github's note on "required status checks" is the following:

> If status checks are required for a repository, the required status checks must pass before you can merge your branch into the protected branch. For more information, see "About protected branches."

The idea here is simple enough: you want every PR to pass some set of tests, linting, etc before merging onto your default branch.

If you don't have a merge queue:

1. your required status checks pass
2. then you can merge directly onto the default branch.

If you **do** have a merge queue:

1. Your required status checks pass
2. **Then you can add your pull request to the merge queue**
3. Your required status checks run again
4. The pull request is squashed and merged onto the default branch

The way Github is set up, “required status checks” affect the ability to add a Pull Request to a Merge Queue, and there cannot be separate checks that only apply to the Merge Queue. Here was a Github Issue where others commented on this behavior, and how confusing it is! [[1]](https://github.com/orgs/community/discussions/47548)

**TL;DR**: Required status checks will run both before the merge queue and during the merge queue. They cannot differ from each other.

## The `${{}}` Expression

When using a `${{}}` expression in a Github Actions file, you must escape it with quotes if the expression starts with `!`

**DOES NOT WORK**

`if: ${{ ! startsWith(github.ref, 'refs/tags/') }}`

**WORKS**

`if: "${{ ! startsWith(github.ref, 'refs/tags/') }}"`

## Triggering Another Github Action

Sometimes you want to "fire-and-forget" trigger another workflow starting. To accomplish this, use the Github CLI instead of the `uses` syntax.

**This waits for `another-job` to finish**

```yml
start-another-job:
  uses: ./.github/workflows/another-job.yml
```

In this setup, the "parent" job will wait and derive its status based on the result of `another-job.yml`.

**Fire and Forget**

```yml
start-another-job-and-exit:
 runs-on: ubuntu-latest
  run: |
     gh workflow run "Another Job" --ref ${{github.ref}}
```

In this setup, the parent job will terminate once the script executes, and the `gh workflow run` command doesn't wait for execution to finish - it just kicks it off.

## Placeholder Workflow

Along with others, I've also found iterating on Github Workflows to be particularly challenging. There's a lot of try-and-fail-and-try-and-fail etc.

One subtle annoyance is that if you create a **new** Github Workflow in a Pull Request, you won't be able to test that workflow until its merged onto the main branch. Let me describe in a little more detail:

```
.
  /.github
    - some-workflow.yml (edited)
```

If you edit `some-workflow.yaml` on a branch, you can trigger `some-workflow.yml` via the UI **off of your branch**.

If you create a new workflow entirely

```
.
  /.github
    - new-workflow.yml (added)
```

You won't be able to see that workflow in the UI - it only shows the workflows present on the main branch.

One solution we've used to minor success is to have a permanent `test-workflow.yml` in our repository for testing these kind of changes. Ours looks like

```yml
# Github action doesn't support running net-new workflows from branches other than the main branch.
# The purpose of this workflow is to just sit in main and allow us to trigger it from custom branches while
# we build various workflows for other things.
name: Workflow placeholder
on:
  workflow_dispatch:

jobs:
  placeholder:
    runs-on: ubuntu-latest
    steps:
      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v3
      - name: Run a one-line script
        run: echo Hello, world!
```

## Linting

Having a linter for Github Actions is pretty convenient, since they have their own set of rules. I found a lot of benefit to using this GitHub Actions extension by Mathieu Dutour [https://marketplace.visualstudio.com/items?itemName=me-dutour-mathieu.vscode-github-actions](https://marketplace.visualstudio.com/items?itemName=me-dutour-mathieu.vscode-github-actions)

## Factor Out the Logic

Having spent a lot of time maintaining and debugging Github Actions, my biggest take away:

**Do as little logic within the Github Action as possible**

What do I mean by this?

Basically, my personal preference is to write as much logic as possible in a sane language where you can re-use code and add tests. If I was to start from scratch, I would have followed this as much as possible. For example, instead of

```yml
do-a-job:
 runs-on: ubuntu-latest
  run: |
    # Check if a file name is provided as an argument
    if [ $# -eq 0 ]; then
        echo "No file name provided. Usage: ./word_count.sh <filename>"
        exit 1
    fi

    # Assign the first argument to a variable
    filename=$1

    # Check if the file exists
    if [ ! -f "$filename" ]; then
        echo "File not found!"
        exit 1
    fi

    # Count the number of words in the file
    word_count=$(wc -w < "$filename")

    # Print the result
    echo "The file '$filename' has $word_count words."
```

Do this instead

```yml
start-another-job-and-exit:
 runs-on: ubuntu-latest
  run: |
      ./scripts/count-words.sh
```

Check in the bash file `word-count.sh`

```bash
# count-words.sh

# Check if a file name is provided as an argument
if [ $# -eq 0 ]; then
    echo "No file name provided. Usage: ./word_count.sh <filename>"
    exit 1
fi

# Assign the first argument to a variable
filename=$1

# Check if the file exists
if [ ! -f "$filename" ]; then
    echo "File not found!"
    exit 1
fi

# Count the number of words in the file
word_count=$(wc -w < "$filename")

# Print the result
echo "The file '$filename' has $word_count words."
```

Or even better (in my opinion) 🙂

```yml
start-another-job-and-exit:
 runs-on: ubuntu-latest
  run: |
      ./scripts/count-words.py
```

It's certainly a matter of personal taste - I've just seen time-and-time again that the lack of testability with Github Actions ends up gathering poor composability and reusability.

## Conclusion

I hope that you benefit from learning about some of these quirks about Github Actions and hopefully save you some time during your next project.
