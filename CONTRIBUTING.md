# Contributing Guidelines

Thank you for your interest in contributing to the `deco-cx/apps` repository! We
are excited to have community members like you involved in improving our
collection of powerful apps. This document outlines how you can contribute
effectively to the project.

## How to Contribute

### Issues

When submitting an issue, please use one of the following types:

- **Issue/Bug**: Report bugs or track existing issues.
- **Issue/Discussion**: Start a discussion to gather input on a topic before it
  becomes a proposal.
- **Issue/Proposal**: Propose a new idea or functionality. This allows for
  feedback before any code is written.
- **Issue/Question**: Ask for help or clarification on any topic related to the
  project.

### Before You File an Issue

Before submitting an issue, ensure the following:

1. **Correct Repository**: Verify that you are filing the issue in the correct
   repository within the deco ecosystem.
2. **Existing Issues**: Search through [open issues](./issues) to check if the
   issue has already been reported or the feature has already been requested.
3. **For Bugs**:
   - Confirm that it’s not an environment-specific issue. Ensure all
     prerequisites (e.g., dependencies, configurations) are met.
   - Provide detailed logs, stack traces, or any other relevant data to help
     diagnose the issue.
4. **For Proposals**:
   - Discuss potential features in the appropriate issue to gather feedback
     before coding.

### Pull Requests

We welcome contributions via pull requests (PRs). Follow this workflow to submit
your changes:

1. **Issue Reference**: Ensure there is an issue raised that corresponds to your
   PR.
2. **Fork and Branch**: Fork the repository and create a new branch for your
   changes.
3. **Code Changes**:
   - Include appropriate tests with your code changes.
   - Run linters and format the code according to project standards:
     - Run `deno task check`
4. **Documentation**: Update any relevant documentation with your changes.
5. **Commit and PR**: Commit your changes and submit a PR for review.
6. **CI Checks**: Ensure that all Continuous Integration (CI) checks pass
   successfully.
7. **Review Process**: A maintainer will review your PR, usually within a few
   days.

#### Work-in-Progress (WIP) PRs

If you’d like early feedback on your work, you can create a PR with the prefix
`[WIP]` to indicate that it is still under development and not ready for
merging.

### Testing Your Contributions

Since this repository contains integrations that must be tested against a deco
site, you cannot test your contributions in isolation. Please refer to this
[Helpful content](https://www.notion.so/decocx/Helpful-Community-Content-101eec7ce64f4becaebb685dd9571e24)
for instructions on how to set up a deco site for testing purposes.

### Use of Third-Party Code

- Ensure that any third-party code included in your contributions comes with the
  appropriate licenses.

### Releasing a New Version

We follow semantic versioning, and all apps in this repository are versioned
collectively using git tags. To release a new version:

1. Fork the repository and create a pull request with your changes.
2. After the PR is approved and merged, request a maintainer to react the
   releaser comment with the required emoji 👍 for **Patch** 🎉 for **Minor** 🚀
   for **Major**

When your PR got merged, a new tag will arrive with the desired semver
modification.
