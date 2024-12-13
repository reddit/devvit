# Devvit

## Contributing to the Devvit public repo

Reddit has a number of open source projects that developers are invited to contribute to in our GitHub repo. The Developer Platform has several  [first-party example apps](https://github.com/reddit/devvit/tree/main/packages/apps) and the [developer documentation](https://github.com/reddit/devvit/tree/main/devvit-docs) open for contribution. There's also a [public issue board](https://github.com/reddit/devvit/issues) that tracks feature requests and bugs. All feedback is welcome!

## Contributor License Agreement

The first time you submit a pull request (PR) to a Reddit project, [you should complete our CLA](https://docs.google.com/forms/d/e/1FAIpQLScG6Bf3yqS05yWV0pbh5Q60AsaXP2mw35_i7ZA19_7jWNJKsg/viewform). We cannot accept PRs from GitHub users that have not agreed to the CLA. Note that this agreement applies to all open source Reddit projects, and you only need to submit it once. 

[Submit your CLA here](https://docs.google.com/forms/d/e/1FAIpQLScG6Bf3yqS05yWV0pbh5Q60AsaXP2mw35_i7ZA19_7jWNJKsg/viewform?usp=sf_link).

## Bugs and requests

Most of our outstanding bugs and user requests are [visible here](https://github.com/reddit/devvit/issues). These are a combination of synced issues from our internal system and user contributions made directly in GitHub. We do our best to keep this up to date with internal progress of bugs and issues.  Before adding an issue to the board, please search for a similar or duplicate issue. You can always comment or react to issues you’d like to see prioritized. 

## Filing a new issue

Please use one of these labels when submitting a new issue:

* bug
* documentation
* enhancement

Once issues are added to our internal tracking system, they will be labeled as “synced”.

## Security issues
Security issues take special priority and are handled separately from our public tracker via [Hackerone](https://www.hackerone.com/). Please do not submit security issues here on GitHub, as all issues are public and publishing them increases the risk of abuse.

## How to make a pull request
Make sure to fork the repository and create a new branch when making changes to a project. Full instructions on setting up dependencies from your branch off our monorepo are detailed below. If you need to brush up on the process of creating a PR, [learn more here](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project).

## Best Practices

* Keep PRs small and as specific to a feature or file as possible
* Review the code structure and patterns prior to making changes
* Keep your contributions consistent with the existing codebase
* Consider where to add helpful in-line comments or sample code
* Use langauge that is clear, concice, and simple

## When changes are reviewed

We'll try to review your PR as soon as possible within one business week of submission. Small changes or updates to our documentation will be faster than changes made to other projects, especially apps. Please note that all not PRs will be accepted and review times may vary.

# reddit-devplatform-monorepo

## Monorepo structure

This monorepo build is managed by [Turborepo](https://github.com/vercel/turborepo), which is a build tool for JavaScript projects.

Different logical parts of the code are split into separate `packages/<foo|bar|baz>` folders. Note that not all packages are  pure JavaScript packages, but the scripts to build and install dependencies, as well as their interdependence on each other, are managed through `package.json` files. This enables TurboRepo to manage the build ordering and high-level commands.

Packages need to each provide their own `yarn build` command.

For an example of how to set things up, check out [turbo's kitchen-sink example](https://github.com/vercel/turborepo/tree/main/examples/kitchen-sink).

To make a new package quickly, you can copy the `template-package` directory and rename it and its `package.json->name` field.

## Building locally

### Dependencies

- Node v22 - specifically, v22.2.0 or later. We recommend you [install it using NVM.](https://github.com/nvm-sh/nvm)
- yarn, should be pre-installed on node18 with corepack enabled:
  ```sh
  corepack enable
  ```

#### Installing

Install JavaScript dependencies by running `yarn` from the repo root. This will install all
dependencies for all packages. It'll also generate a `yarn.lock` file, which is ignored - we
maintain that lockfile internally, so you don't need to worry about it in this repo.

### Running commands for a specific workspace

- Top level `yarn <foo>` commands run through [turborepo](https://github.com/vercel/turborepo for
  all packages
- `yarn workspace <package-name> foo` will do `yarn run foo`only for the package with matching
  `<package-name>`field from a specific `package.json`

### Build all packages

- `yarn` to install
- `yarn build` to build all packages in order

### Testing, linting, and type checking

- `yarn` to install deps
- `yarn test` to test all packages and check their TypeScript types
- `yarn lint` to lint all packages

## Help

Need help? Check out the [Devvit](https://www.reddit.com/r/devvit/) community on
Reddit.
