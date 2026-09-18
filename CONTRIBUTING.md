# Contributing

Thanks for helping improve these projects. Each folder is an independent demo. Most run directly in a browser; the file upload and URL shortener demos also need PHP. See the [project README](README.md) for setup instructions.

## Make a change

1. Create a branch from `main` and keep the change focused on one project or issue.
2. Follow the existing HTML, CSS, and JavaScript style in that project. Keep browser demos usable with a keyboard and at narrow screen widths.
3. Run `python3 scripts/check_repository.py` from the repository root. It checks first-party JavaScript and PHP syntax and local links in entry pages; Node.js and PHP must be installed. Then run the affected demo locally, check the browser console, and test the interaction you changed. For PHP changes, use a local PHP server and test the relevant request flow.
4. Open a pull request against `main`. Explain what changed, how you checked it, and include screenshots when a visual change is hard to describe.

The repository check is a baseline, not a substitute for testing behavior in a browser. If you add a project-specific check, document how to run it in that project's README.

## Attribution and dependencies

Contributions are made under the repository's [MIT License](LICENSE). Keep the Thomas Brown copyright notice and existing author credits in copies or substantial portions of the work. When adding third-party code, images, fonts, or other assets, check that their licenses allow redistribution and include any required notices. Do not include credentials, personal data, or generated files that are not needed to run a demo.

For a security concern, follow [SECURITY.md](SECURITY.md) instead of opening a public issue with sensitive details.
