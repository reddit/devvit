# reddit-devplatform-monorepo

Need help? Check out the [Reddit Developer Platform](https://www.reddit.com/r/devvit/) community on
Reddit.

# Monorepo structure

This is a mono repo whose build is managed by [Turborepo](https://github.com/vercel/turborepo), a monorepo build tool for javascript projects.

Different logical parts of the code are split into separate `packages/<foo|bar|baz>` folders. Note that not all packages are necessarily pure JavaScript packages, but the scripts to build, install dependencies, and their interdependence on each other are managed through `package.json` files so that TurboRepo can manage the build ordering and high-level commands.

Packages will need to each provide their own `yarn build` command.

The repo we can look to for examples of how to set things up is [turbo's kitchen-sink example](https://github.com/vercel/turborepo/tree/main/examples/kitchen-sink)

To quickly make a new package you should be able to copy the `template-package` directory and rename it and its `package.json->name` field

# Building locally

## Dependencies

- Node v18 - specifically, v18.18.2 or later, but not v20 (yet!). We recommend you [install it using NVM.](https://github.com/nvm-sh/nvm)
- yarn, should be pre-installed on node18 with corepack enabled:
  ```sh
  corepack enable
  ```

### Installing

Install javascript dependencies by running `yarn` from the repo root. This will install all
dependencies for all packages. It'll also generate a `yarn.lock` file, which is ignored - we
maintain that lockfile internally, so we don't need to worry about it in this repo.

## Running commands for a specific workspace

- Top level `yarn <foo>` commands run through [turborepo](https://github.com/vercel/turborepo for
  all packages
- `yarn workspace <package-name> foo` will do `yarn run foo`only for the package with matching
  `<package-name>`field from a specific `package.json`

## Build all packages

- `yarn` to install
- `yarn build` to build all packages in order

## Testing, Linting, and Type Checking

- `yarn` to install deps
- `yarn test` to test all packages and check their TypeScript types
- `yarn lint` to lint all packages

## Pre-commit Linting

The repo is set up to do some basic and global linting and formatting through package.json's husky
config. This is a good way to catch some basic issues before you commit.

