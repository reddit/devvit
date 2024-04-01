## Use an app template

App templates provide complete, functioning code examples which you can use to explore the platform and jumpstart your own projects. Templates are built into the app creation flow, and you can use the `-t` flag when creating a new project:

```bash
devvit new -t <template name> <app name>
```

### Available templates

| Template      | Description                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| hello-world   | Illustrates the different places and configurations you can use on your custom Menu actions. Each simply prints a toast message to the screen.                                                         |
| remind-me     | Remind a user of a post or comment at a later time via a private message. It uses the Scheduler plugin to trigger an event at a later time and the Reddit API plugin to send a user a private message. |
| three-strikes | A moderation tool to give a “bad” user strikes and inform mods when a user gets three strikes. This uses the Key Value Store plugin to store state on a per user/subreddit basis.                      |
| empty         | The default, boilerplate project template. Calling `devvit new` will use this template.                                                                                                                |

### Try it now

You'll be prompted to select a template during the new project creation flow.

```bash
devvit new -t remind-me my-remind-me
```

If you would like to see some example apps, please reach out to our team [via modmail](https://www.reddit.com/message/compose/?to=%2Fr%2FDevvit) to request access to the private Devvit repository.
