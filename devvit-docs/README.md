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

### Update the versioned docs

If you want to update the versioned docs _without_ doing an [NPM package update](../docs/publishing.md), create a new branch, run the `docs:update-versioned` task like so, from the repo root:

```
git checkout main
git pull                                # Pull down the latest repository updates
git submodule update --init --recursive # Make sure submodules are in the right state
git checkout -b update-versioned-docs   # Start a new branch
yarn docs:update-versioned              # Update the versioned docs for the current version
git push origin update-versioned-docs   # Push the branch to start a PR.
```

Then follow the link printed out to create a pull request.

### Updating Firehose docs

Firehose docs are auto-generated from source code, and the source has been moved to [another repository](https://github.snooguts.net/reddit/devplatform-api). So to update the firehose docs, the best way is to make changes there, and then re-generate the docs here.

1.  Make sure you have both repositories ([monorepo](https://github.snooguts.net/reddit/reddit-devplatform-monorepo) and [devplatform-api](https://github.snooguts.net/reddit/devplatform-api)) checked out as siblings, i.e. sharing the parent folder

2.  In [reddit/devplatform-api](https://github.snooguts.net/reddit/devplatform-api):

    a) Go to and make changes to `.proto` files

    b) Run `make protos` in the root of the project when done

    c) Submit your changes and create a PR

    d) Once PR is approved and comments are addressed, go to [#devplatform-firehose-salon](https://reddit.enterprise.slack.com/archives/C062RC9K8JV) on Slack and release your PR by using @Harold to acquire a turn in merging your changes

    e) Once your changes are merged, go back to the monorepo

3.  In [reddit/reddit-devplatform-monorepo](https://github.snooguts.net/reddit/reddit-devplatform-monorepo)

    a) Run the following command:

    ```bash
    cd devvit-docs/scripts
    node editOpenApi.js
    ```

    b) After that script is finished running you should have unstaged changes. Commit these changes, submit a PR.

    c) Once PR is approved and comments are addressed, go to [#devplatform-salon](https://reddit.enterprise.slack.com/archives/C02E3NJMG2E) on Slack and release your PR by using @Harold to acquire a turn in merging your changes
