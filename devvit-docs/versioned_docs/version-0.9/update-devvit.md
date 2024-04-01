# Update Devvit

To update your Devvit CLI, first you'll need to uninstall the existing version. Run:

```bash
npm -g uninstall @devvit/cli
```

Then install the updated Devvit CLI:

```bash
npm install -g devvit
```

:::note

This assumes you have installed `Node.js` and have `npm` available. If you are unsure if these tools are installed, see our [Quickstart](quickstart)

:::

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
