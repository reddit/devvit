# Create

Building apps for your subreddit lets you customize your community and automate mod functions. Once you’ve installed Devvit and registered as a Reddit developer, you’ll be ready to create an app.

## Update your CLI

First, make sure you are running the latest version of the `devvit` CLI. Run:

```bash

npm install -g devvit

```

:::note

If you are running into errors, check out our quickstart for complete instructions on how to set up your development environment.

:::

## Make your app

Making an app is easy. You can create your own app from scratch or use an [app template](templates.md) to start with complete, functioning code examples.

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

## Use an app template

App templates provide complete, functioning code examples which you can use to explore the platform and jumpstart your own projects. Templates are built into the app creation flow, and you can use the `-t` flag when creating a new project:

```bash
devvit new -t <template name> <app name>
```

**Available templates**

| Template      | Description                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| hello-world   | Illustrates the different places and configurations you can use on your custom Menu actions. Each simply prints a toast message to the screen.                                                         |
| remind-me     | Remind a user of a post or comment at a later time via a private message. It uses the Scheduler plugin to trigger an event at a later time and the Reddit API plugin to send a user a private message. |
| three-strikes | A moderation tool to give a “bad” user strikes and inform mods when a user gets three strikes. This uses the Key Value Store plugin to store state on a per user/subreddit basis.                      |
| empty         | The default, boilerplate project template. Calling `devvit new` will use this template.                                                                                                                |

**Try it now**
You'll be prompted to select a template during the new project creation flow.

```bash
devvit new -t remind-me my-remind-me
```

If you would like to see some example apps, please reach out to our team [via modmail](https://www.reddit.com/message/compose/?to=%2Fr%2FDevvit) to request access to the private Devvit repository.

## View your app

To see your app in action:

1. Navigate to [reddit.com](https://www.reddit.com) on your desktop web browser (Android and iOS support are coming soon!).
2. Go to the subreddit where you installed your app.
3. Make sure there is at least one post.
4. Click the three dots on the bottom of the post. You'll see several robot icons with your app's associated actions at the bottom of the menu.

![qs complete](./assets/qs_complete.png)
