---
title: "Github Actions lessons learned the hard way"
publishedAt: "2024-07-27"
summary: "Subtleties and Gotcha's when working with Github Actions: LARPing as a devops engineer"
---

## Overview

Here are a few short tips and lessons I've learned while working on Github Actions (or how I learned to LARP as a devops engineer).

The following are things small and large I've learned, re-learned, and re-re-learned working with Github Actions.

Many of these were learned during a big undertaking to enable basic continuous deploys in a prior role. I'll share the full details on that in another post, but I think these are more interesting and useful even out of that context.

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

1. your required status checks pass,
2. **Then you can add your pull request to the merge queue**
3. Some additional checks run as part of the merge queue
4. The pull request is squashed and merged onto the default branch

The way Github is set up, “required status checks” affect the ability to add a Pull Request to a Merge Queue, and there cannot be separate checks that only apply to the Merge Queue. Here was a Github Issue where others commented on this behavior, and how confusing it is! [[5]](https://github.com/orgs/community/discussions/47548)
