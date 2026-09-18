# Repository settings for maintainers

Repository rules and the default branch are GitHub settings; this file records the intended setup for this project.

## Main branch

1. In **Settings → General → Default branch**, select `main`.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the publishing source. The Pages workflow in this repository runs only for `main` and publishes static files; PHP source and server configuration are left out of its artifact.
3. After the `Validate source` workflow has run on `main`, open **Settings → Rules → Rulesets** and create an active branch ruleset targeting `main`.

Recommended rules:

- Require a pull request before merging. If you maintain the repository alone, start with zero required approvals; use one or more when another reviewer is available.
- Require the `Validate source` status check to pass before merging.
- Block force pushes and deletions of `main`.
- Leave bypass access empty unless a specific maintainer needs emergency access.

The workflow checks first-party JavaScript and PHP syntax and local links in entry pages. See [Contributing](../CONTRIBUTING.md) to run the same check locally.

GitHub's [default branch guide](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch), [ruleset guide](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository), and [Pages guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) cover the corresponding settings.
