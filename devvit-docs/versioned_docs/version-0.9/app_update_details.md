# Update

## Update your app

To edit your app name and description, select “Edit app details” from your app page.

Note that when you publish an updated app, subreddits using your app will remain on the prior version until the moderator chooses to upgrade to the updated version. If your app is listed publicly, the new version will be available after it has been reviewed.

### Failed builds

:::info
If your build fails, the affected version of your app will not be able to be installed until it is fixed. As the app developer you will see a notification in the App details section, telling you which version failed.

![app failed build error](./assets/app_failed_build_error.png)

You can install a previous version using the CLI:

```ts
devvit install app-slug@version r/location
```

As a moderator, you will always see the most recent successfully built version of the app. Your installation process should not be affected.
:::

## Update Devvit

Run the following `npm` command to update your Devvit CLI:

:::note

This assumes you have installed `Node.js` and have `npm` available. If you are unsure if these tools are installed, see our [Quickstart](quickstart)

:::

```bash
npm update -g @devvit/cli
```

## Upgrade your app to the latest version of Devvit

You'll need to upgrade any existing apps to the latest version of Devvit if you plan to use any features in the new release. You can do this using `devvit update app`.

First, move into the top-level directory of your app

```bash

my-simpler-project  # <- you should be here
├── devvit.yaml
├── package.json
├── src
│   └── main.ts
├── tsconfig.json
├── yarn.lock
```

Next, run:

```bash
devvit update app
```

Finally, you can check the version of Devvit your app is using by looking in the top-level `package.json` file.

```bash

my-simpler-project
├── devvit.yaml
├── package.json      # <- open this file
├── src
│   └── main.ts
├── tsconfig.json
├── yarn.lock
```

You should see the devvit version under `devDependencies`:

```bash
{
  "name": "mrt-0-8-remind-me",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "license": "BSD-3-Clause",
  "main": "index.js",
  "workspaces": [
    "actors/my-actor"
  ],
  "devDependencies": {
    "@devvit/tsconfig": "0.8.0",     #<- should be the new version of devvit
    "typescript": "4.9.3"
  },
}
```
