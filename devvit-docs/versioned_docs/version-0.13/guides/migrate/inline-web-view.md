# Migrating from useWebView to Devvit Web

This guide will migrate your legacy webview implementation (using useWebView inside of Blocks) to the official Devvit Web setup.

:::note
Apps can be partially migrated, you don't need to re-write everything!
:::

# Before

- Use postMessage for message passing
- App logic is isomorphic (server/client) in Blocks
- No client effects available

# After

- No postMessage required
- Use web native fetch() to server endpoints directly
- App logic is either on the client, or the server, with clear deliniation
- Client effects are available directly from web views

## Setting up devvit.json

The first thing you need to do is setup `devvit.json`.

Schema here: https://developers.reddit.com/schema/config-file.v1.json

`devvit.json` supports all capabilities previously available in the `Devvit` singleton, e.g. `Devvit.addCustomPostType()`. For the purposes of this guide, only the post rendering logic will be migrated.

### Understanding entrypoints

Your `devvit.json` must have entrypoints that point to **outputs** of your code. It is assumed that you have installed a bundler or can otherwise prepare static assets to appear in your dist folders.

```js
{
  "post": {
    "client": { // The output of your client app, probably /src/webroot
      "dir": "dist/client",
      "entry": "dist/client/index.html"
    }
  },
  "blocks": { // point to where you export Devvit singleton, probably src/main.tsx
    "entry": "src/devvit/main.tsx"
  },
  "server": { // new folder which will contain your Node server
    "entry": "dist/server/index.cjs"
  },
}
```

> You'll notice that the `blocks` entrypoint points to your TypeScript source file (`src/devvit/main.tsx`). This is because the Devvit CLI handles bundling for Blocks automatically. For your `client` and `server` entrypoints, however, you are responsible for bundling your code and pointing to the final output files in your `dist` directory.

### Building your client and server

The `devvit.json` configuration for `client` and `server` points to files in a `dist` directory. This means you're responsible for building your web and server assets. You can use any bundler you like, such as `vite`.

For example, your `package.json` might include scripts to output your assets to the `dist` folder.

Sample server vite config

```ts title="src/server/vite.config.ts
import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

export default defineConfig({
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: 'index.ts',
    outDir: '../../dist/server',
    target: 'node22',
    sourcemap: true,
    rollupOptions: {
      external: [...builtinModules],

      output: {
        format: 'cjs',
        entryFileNames: 'index.cjs',
        inlineDynamicImports: true,
      },
    },
  },
});
```

Sample client Vite config (for React)

```ts title="src/client/vite.config.ts
import { defineConfig } from 'vite';
import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  build: {
    outDir: '../../dist/client',
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
  },
});
```

## Setting up your server endpoints

You can use any Node server for your server endpoints. This guide will use [Express](https://expressjs.com/).

1. Install Express

```
npm i express
```

2. Create a server index file

```ts title='src/server/index.ts'
import express from 'express';
// The `@devvit/server` package provides the tools to create a server,
// and gives you access to the request context.
import { createServer, context, getServerPort, redis } from '@devvit/web/server';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

// The `context` object is automatically populated with useful information,
// like the current user's ID. Devvit's services, like redis, are also
// available via named imports from `@devvit/server`.
router.get<{ postId: string }, { message: string }>(
  '/api/hello',
  async (_req, res): Promise<void> => {
    const { userId } = context;
    res.status(200).json({
      message: `Hello ${userId}`,
    });
  }
);

router.get('/api/init', async (_req, res): Promise<void> => {
  res.json({ initialState: await redis.get('initialState') });
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));
```

### Calling your server endpoints

Now

Instead of using `postMessage`, your client-side code can now directly fetch the initial state from the `/api/init` endpoint we defined in the server.

```ts title=/src/client/app.ts
const res = await fetch('/api/init');
const data = await res.json();
console.log(data.initialState); // Logs the state from Redis
```

## Client effects

Previously, client effects were not available to your webview app. You had to pass a custom postMessage and handle that message in Blocks. Now, all client effects are available directly in the web-view through `@devvit/client`.

Before

```ts title=/src/devvit/main.tsx
const BlocksComponent = () => {
  const wv = useWebView({
    onMessage: (message) => {
      if (message.type === 'navigate_to') {
        ui.navigateTo(message.data.destination);
      }
    },
  });
};
```

```js title=webroot/app.js
window.postMessage({ type: 'navigate_to', destination: 'reddit.com' });
```

Now

```ts title=client/app.ts
import { navigateTo } from '@devvit/web/client';

navigateTo('reddit.com');
```
