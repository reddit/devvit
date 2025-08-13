# Migrating from Devvit Web Experimental to Devvit Web

This guide will help you migrate from the experimental version of Devvit Web to the official Devvit Web setup. You must complete this migration to publish and grow your app.

> **Note**: Apps can be partially migrated, you don't need to re-write everything!

## How to identify if you're using the experimental version

You're using Devvit Web experimental if:

- Your project is based on either of these templates:
  - https://github.com/reddit/devvit-bolt-starter-experimental
  - https://github.com/reddit/devvit-template-react
- You have a `defineConfig` function in `src/devvit/main.tsx`

## What's changing

### Before (experimental)

- Uses `defineConfig` function in blocks
- Multiple `@devvit/X` packages for different capabilities
- Webroot-based dist outputs

### After (final version)

- Uses `devvit.json` for all configuration
- Single `@devvit/web` package with submodule imports
- Cleaner dist folder structure
- Clear separation of client and server code

## Migration steps

### 1. Install the latest @devvit/web

```bash
npm install @devvit/web@latest
```

### 2. Remove individual @devvit packages

Remove all individual capability packages:

```bash
npm uninstall @devvit/redis @devvit/server @devvit/client
```

### 3. Create your devvit.json

Create a `devvit.json` file in your project root. This replaces all configuration previously done through `defineConfig`:

```json
{
  "post": {
    "client": {
      "dir": "dist/client",
      "entry": "dist/client/index.html"
    }
  },
  "blocks": {
    "entry": "src/devvit/main.tsx"
  },
  "server": {
    "entry": "dist/server/index.cjs"
  }
}
```

> **Note**: Output directories no longer need to go to `webroot`. Use `dist/client` and `dist/server` for cleaner organization.

### 4. Update your imports

Change all imports from individual packages to the unified `@devvit/web` package:

#### Server-side imports

```typescript
// Before
import { redis } from '@devvit/redis';
import { createServer, context } from '@devvit/server';

// After
import { redis } from '@devvit/web/server';
import { createServer, context } from '@devvit/web/server';
```

#### Client-side imports

```typescript
// Before
import { navigateTo } from '@devvit/client';

// After
import { navigateTo } from '@devvit/web/client';
```

### 5. Remove defineConfig from main.tsx

In your `src/devvit/main.tsx`, remove the `defineConfig` function and any configuration it contained. This configuration now lives in `devvit.json`.

```typescript
// Before in src/devvit/main.tsx
import { defineConfig } from '@devvit/server';

export default defineConfig({
  // ... configuration
});

// After
// Simply export your Devvit instance or any Devvit.addX functions
import { Devvit } from '@devvit/web';

// Your Devvit setup code here
export default Devvit;
```

### 6. Reorganize your project structure

We recommend using a clean folder structure:

```
your-app/
├── src/
│   ├── client/         # Your web app (React, etc.)
│   │   └── index.tsx
│   ├── server/         # Your server endpoints
│   │   └── index.ts
│   └── devvit/         # Blocks-related code (optional now)
│       └── main.tsx
├── dist/               # Built assets
│   ├── client/
│   └── server/
├── devvit.json
└── package.json
```

### 7. Update your build configuration

Ensure your bundler outputs to the correct directories specified in `devvit.json`:

#### Server Vite config example

```typescript
export default defineConfig({
  ssr: {
    noExternal: true,
  },
  build: {
    emptyOutDir: false,
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

#### Client Vite config example

```typescript
export default defineConfig({
  build: {
    outDir: '../../dist/client', // No longer webroot
  },
});
```

## Quick migration path

For the fastest migration:

1. **Start with a new template**: Clone https://github.com/reddit/devvit-template-react
2. **Move your server endpoints**: Copy your server code to the `src/server` folder
3. **Move your client app**: Copy your React/web code to the `src/client` folder
4. **Update imports**: Find and replace all `@devvit/X` imports with `@devvit/web/server` or `@devvit/web/client`
5. **Configure devvit.json**: Set up your entrypoints as shown above and update your app name
6. **Test locally**: Run `npm run dev` to ensure everything works

## Additional considerations

- All capabilities previously available through the experimental API are still available in the final version
- The context object and Redis access work the same way, just with different import paths
- Your app logic can still be split between client and server as before
