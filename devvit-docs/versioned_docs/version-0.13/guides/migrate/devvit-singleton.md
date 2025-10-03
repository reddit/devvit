# Migrating Blocks/Mod Tools to Devvit Web

This guide covers migrating traditional Devvit apps (using only Blocks or Mod Tools, without web views) to the Devvit Web setup. This is a straightforward migration that requires minimal changes.

## Overview

The migration primarily involves switching from `devvit.yaml` to `devvit.json` configuration. Your existing Blocks and Mod Tools code will continue to work with minimal changes.

## Migration steps

### 1. Create devvit.json

Create a `devvit.json` file in your project root with your app configuration:

```json
{
  "name": "your-app-name",
  "blocks": {
    "entry": "src/main.tsx",
    "triggers": ["onPostCreate"]
  }
}
```

Replace:

- `"your-app-name"` with your actual app name
- `"src/main.tsx"` with the path to your main Blocks entry point (where you export your Devvit instance)
- Include any triggers used in your src/main.tsx in the triggers array (or remove the parameter)

### 2. Remove devvit.yaml

Delete the `devvit.yaml` file from your project root. All configuration is now handled by `devvit.json`.

### 3. Handle static assets

If your app uses static assets (images, fonts, etc.) from an `assets` folder, you'll need to define this in update your `devvit.json` to point to these assets:

```json
{
  "name": "your-app-name",
  "blocks": {
    "entry": "src/main.tsx",
    "triggers": ["onPostCreate"]
  },
  "media": {
    "dir": "assets/"
  }
}
```

### 4. Test your app

Run your app locally to ensure everything works:

```bash
devvit playtest
```

## That's it!

Your Blocks and Mod Tools code should work as intended without any other changes. The Devvit runtime handles the compatibility layer automatically.

While your app will work with just these changes, we recommend exploring the additional capabilities available in Devvit Web over time.
