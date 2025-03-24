# Build

Building apps for your subreddit lets you customize your community and automate mod functions. Once you’ve installed devvit and registered as a Reddit developer, you’ll be ready to create an app.

## Install or update your CLI

First, make sure you are running the latest version of the `devvit` CLI. The `npm install -g` command will either install or update your package. Run:

```bash
npm install -g @devvit/cli
```

:::note

If you are running into errors, check out our guide for how to set up your [development environment](./dev_guide.mdx#environmentsetup).

:::

## Create an app

Creating an app is easy. You can create your own app from scratch or use an [app template](./templates.mdx) to start with complete, functioning code examples.

To create a new app, navigate to your selected app folder and run the create command.

```
$ devvit new <app-name>
```

:::note

Project names must be six or more characters, all lowercase, can't start with numerals and include only a-z, 0-9 or '-'. We recommend "kebob-case" names.

:::

To create an app based on a template, use the -t flag to create a new project. The following example creates an app based on the Remind Me template.

```bash
devvit new -t remind-me my-first-app
```
