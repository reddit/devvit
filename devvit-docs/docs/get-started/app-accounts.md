# App accounts

An app account is a separate user account just for your app that is automatically generated when the app is uploaded.

## How do I create an app account?

When a new app is created, the app account is automatically generated when you upload your app to the Developer Portal.

By default, the app account username is based on your app’s identifier. For example, if you run `devvit new my-first-app`, the user account ID will be `my-first-app-zzz`. The three-letter suffix makes creation easy by ensuring your app has a unique name.

:::

## Permissions

Your app account has the same permissions that are granted to your app.

Currently, when an app is installed, it will have Moderation Everything permissions, but soon apps will only be granted permissions they need on install.

## What the mods see

Once a mod installs your app, the app’s user account will appear in the mod list. When the app is executed, the action comes from the app’s user account. App execution may not work if the app account is removed as a moderator.

This process is automatic–you don’t need to do anything except keep creating awesome apps.

## Finding your app ID

Your app name is recorded in your devvit.yaml file at the top level of your project directory.

```text
rdp-fotd-dev
├── devvit.yaml       # <- find your app name here
├── node_modules
├── package.json
├── src
├── tsconfig.json
├── yarn.lock

```

Viewing this file will show you your app name. Changing this file will not change your app name.

```text
% cat devvit.yaml
name: <your-app-name>
slug: <app-account-username>
version: 0.0.0
packageManager: yarn

```

## FAQs

**Why does my app account have a random 3-character suffix?**

The app account username is automatically generated from the app identifier, which has a 3-character suffix.

**Can I customize my app account?**

The app account cannot be customized at this time, but contact us if you have a use case that may require this.

**How do I add an app account to an existing app?**

Simply re-upload your app to the Developer Portal, and an app account will automatically be created.

**What happens if I change my app’s name?**

The display name can be changed via the Developer Portal, but the app account name cannot be changed at this time. If you want to change the app account name, create a new app with the desired name and migrate your code to the new directory.

**I have bots I’d like to migrate to Devvit with an existing username.**
We want beloved bots to have a place on our platform, we’ll work with bots in good standing to migrate if/when they want to, provided the original bot author is driving the process.
