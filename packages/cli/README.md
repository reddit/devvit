# IF YOU ARE TRYING TO INSTALL THE CLI, THIS IS PROBABLY THE WRONG PACKAGE!!

Check out [devvit](https://www.npmjs.com/package/devvit) instead!

# @devvit/cli

Sign up for Reddit's Developer Platform [here!](https://developers.reddit.com)

`devvit` is the command line interface to the [Reddit Developer Platform](https://developers.reddit.com/)

More on available commands: [CLI docs](https://developers.reddit.com/docs/devvit_cli)

## Local development

You can run the local version of `devvit` called `mydevvit`.
It uses your local source code instead of the one published to NPM.

You need to run a few commands to make it work on your computer:

### One-time preparation

Start in the repo root

1. `yarn && yarn build`
2. `cd packages/cli`
3. `yarn install:dev`
4. `source ~/.zshrc` (or restart your terminal)

These commands ensure you have the `mydevvit` command available in your console. During later
development, you'll only need to rebuild sources to use `mydevvit`.

### After code changes

For CLI-only changes, running `yarn build` in `packages/cli` is enough. Make sure to run
`yarn && yarn build` in the repo root after pulling from the remote or making changes outside of
`packages/cli`!

### Running mydevvit

Devvit CLI interacts with the Dev Portal API, which at present cannot be run locally. As a result,
to run `mydevvit`, you'll need to tell it to point at the production version of the API like this:

`MY_PORTAL=0 mydevvit [command] # executes [command] using your local devvit cli, but production backend`
