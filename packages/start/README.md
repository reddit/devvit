# `@devvit/start`

Vite plugin for building Devvit apps. Automatically handles both your client and server builds.

## Install

```sh
npm install -D @devvit/start
```

## Usage

Add `devvit()` to your `vite.config.ts` (it’s safest to place it **last** in the plugins array):

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { devvit } from '@devvit/start/vite';

export default defineConfig({
  plugins: [react(), tailwind(), devvit()],
});
```

## Development

Run this command to start developing:

```sh
npm run dev
```

The plugin automatically builds both client and server in watch mode. Changes to either will trigger a rebuild.

## Production Build

```sh
npm run build
```

Builds optimized client and server bundles for production.

## Configuration

All options are optional. The plugin works out of the box with sensible defaults and merges your overrides into each environment’s Vite config.

```ts
devvit({
  logLevel: 'warn',     // Vite log level: 'info' | 'warn' | 'error' | 'silent' (default: 'warn')
  client: {},           // Vite EnvironmentOptions (merged into the client environment)
  server: {}            // Vite EnvironmentOptions (merged into the server environment)
})
```
