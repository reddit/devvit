# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn docs:start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

Note:

- Changes does not appear on snoodev env can only be tested locally

### Build

```
$ yarn docs:build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Development lifecycle

For small doc updates you can skip the deployment phase.

Once you have your PR approved, make sure to add `[CI SKIP]` to your commit message in GitHub.
More info in [Drone documentation for skipping](https://docs.drone.io/pipeline/skipping/).

Now you can merge your PR.

Important: do not use `[CI SKIP]` when you `git commit` since your PR will be stuck in pending state.
You only need to add it immediately before merging the PR.

### Deployment

For how to merge your PR see [Development lifecycle](#development-lifecycle)

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
