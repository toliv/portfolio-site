---
title: "Setting up continuous deployment through Github Actions"
publishedAt: "2024-08-01"
summary: "Lessons learned the hard way setting up a continuous deployment through Github Actions."
---

[Skip straight to the lessons 🙂](#things-that-i-learned-the-hard-way)

## Background

Up until around January this year, the deployment story at my company was a little sad, frankly. We had around 10-12 engineers, yet were still relying on individual human-triggered deploys. Tired of this unnecessary pet-sitting and seeking a much-needed upgrade, I took on the mission of upgrading our setup from **painfully-manual** to **comfortably-automatic**.

The goal outcomes were:

- Every commit to our `main` branch should be automatically deployed to the `staging` environment
- An engineer should be able to trigger a deploy to the `live` environment based on the current version of code running in the `staging` environment.

Clarifying our environment setup, we had two environments:

- `staging`, our staging environment used for engineering and product to validate and iterate on new features.
- `live`, our production environment where live customers have access to our product

Until this point, we had used a single `deploy.yml` Github Action which was manually triggered from the Github Actions UI, taking two inputs

- a branch (default to our `main` branch)
- a choice of environment (`staging` or `live`)

In this iteration, a deployment to `live` also deployed to `staging`.

## The Merge Queue

We use Github's Merge Queue [0] to help validate merging code that relies on common state such as database migrations.

Since the merge queue inherently handles concurrency by queuing merge requests and offering parameters such as minimum and maximum number of PRs to merge, we felt this was a good place to start. I will also note, my previous experience with Gitlab Merge Train led me to this perception of the Merge Queue. Our attempt at modifying our `merge-queue.yml` Action file to facilitate this looked like

```yml
name: Merge Queue
  permissions: write-all

on:
  merge_group:
  branches: [main]
  types: [checks_requested]

jobs:
  validate-migrations:
    uses: ./.github/workflows/check-db-migrations.yml
    secrets: inherit
  deploy-to-staging:
    uses: ./.github/workflows/deploy-to-staging.yml
    needs: [validate-migrations]
    secrets: inherit
```

Our first thought here was that a commit should only be merged to the `main` branch if it had deployed successfully.

However, this approach had a few flaws. Required status checks [1] to merge a commit to the `main` branch are tied to the ability to add a Pull Request to the Merge Queue. The implication of this is that required status checks must run on a Pull Request both before adding to the merge queue and during the merge queue checks_requested. If we wanted this `deploy-to-staging` to be a required check to merge a commit into `main`, we would have needed that job to run on every commit to every Pull Request pre-Merge Queue.

### ⚠️ Note

One feature that could make Github Actions a easier to work with here would be allowing for distinct required checks between

- Adding a Pull Request to the Merge Queue
- Merging a Pull Request (group) from the Merge Queue into the default branch

## Using the On: trigger

After discovering that the Merge Queue wasn't the right place for the deployment logic to live, we transitioned to a new approach where:

1. Pull Request passes validations (typechecking, units, etc)
2. Pull Request added to Merge Queue group
3. Merge Queue group passes validations
4. Squashed commit merged to `main` branch
5. `deploy-to-staging.yml` workflow would be triggered on each commit to the `main` branch

In this approach, however, one new aspect of concern was managing job concurrency [2] on the `deploy-to-staging.yml` job. As opposed to the Merge Queue which supported that concurrency inherently, we now needed to control for that ourselves. By adding a `concurrency` key, we were able to control that only a single deploy job instance could run at a time, and subsequent runs would be queued behind. To achieve this, our basic workflow setup looked like

```yml
name: Deploy to Staging

run-name: Deploy to Staging
on:
  push:
    branches: [main]

concurrency:
  group: "deploy-staging"

jobs:
 build-image: # example
    runs-on: ubuntu-latest
    ...
```

## Deploying to Prod

At this point we were able to see that a Pull Request could be merged via the Merge Queue, then deployed to `staging` after being merged to `main`.

However, we still had half of the puzzle missing - continuing the deploy past `staging` to `live`. Going back to our original goals, we want every successful deploy to `staging` to create a pending deployment to `live` which needs operator approval to move forward.

We have a Github Actions workflow `deploy-to-live.yml` which looks like

```yml
name: Deploy to Live

run-name: Deploy Live
on:
  workflow_dispatch:
    inputs:
      gitsha:
        type: string
        required: true

jobs:
  deploy-live-approval:
    name: Live Deploy Approval
    uses: ./.github/workflows/deploy-approval.yml

 deploy-live-post-approval:
    name: Deploy to Live
    needs: deploy-live-approval
    secrets: inherit
    permissions:
      contents: write
    uses: ./.github/workflows/deploy-to-live-post-approval.yml
    with:
      gitsha: ${{github.event.inputs.gitsha}}
```

For context, the `deploy-approval.yml` workflow waits for the operator to step through a one-step dialog to approve the deployment.

Our naive first attempt at wiring this behavior into the `deploy-to-staging.yml` job was to add the workflow call at the end of the workflow file like

```yml
name: Deploy to Staging

run-name: Deploy to Staging
on:
  push:
    branches: [main]

concurrency:
  group: "deploy-staging"

jobs:
 build-image: # example
    runs-on: ubuntu-latest
  uses: ./.github/workflows/build-image.yml
    ...
  create-live-deploy-approval: # new
    uses: ./.github/workflows/deploy-to-live.yml
    needs: [build-image...]
```

Although close, this did not quite achieve the expected result.

Since the first step of `deploy-to-live.yml` waits for user input, it remains in a pending state.

Because we have a concurrency group on this whole `deploy-to-staging.yml` job, this **prevents subsequent attempts to run this workflow from running.**

When we call a reusable workflow from one Github Action, its result status [3] propagates up to the caller. Usually, this is what we want: In the example above, if the `build-image.yml` workflow fails, we don’t want to continue. However in this case, we want a “fire-and-forget” approach, where we trigger the `deploy-to-live.yml` workflow, but not tie the status of `deploy-to-staging.yml` to its output.

In this case, we found an excellent way to achieve this behavior is via the Github CLI tool [4] like so:

```yml
create-prod-deploy-approval:
  name: Trigger prod deploy approval
  permissions: write-all
  runs-on: ubuntu-latest
  needs: [build-image...]
  steps: - uses: actions/checkout@v3 - id: trigger-prod-deploy-approval
  env:
  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          run: |
            gh workflow run "Deploy to Prod" --ref ${{github.ref}} -f gitsha=${{github.sha}}
```

Now we’re in an awesome spot, to recap:

1. Pull Requests run a set of checks prior to being added to the Merge Queue
2. Pull Requests in the Merge Queue run some checks again
3. After Merge Queue checks succeed, a squashed commit is merged onto proto
4. When a commit is merged onto proto, the `deploy-to-staging.yml` workflow is automatically triggered
5. After a successful execution of build, deployment to `staging`, and canary testing, “fire-and-forget” a run of `deploy-to-live.ym`l which can proceed with operator approval

🎉

## Conclusion

I've shared here our journey to manual deployment to semi-automated continuous deployment via Github Actions. I hope that you find some value in seeing this experience so you can go about it differently.

I'd also invite you to check out my other post [Github Actions lessons learned the hard way](oliverio.dev/) for a few more subtleties of writing Github Actions workflows.
