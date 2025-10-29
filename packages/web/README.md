# @devvit/web

A central package for all your Devvit Web needs! This package provides the core functionality for
building web applications with Devvit. Just bring your own framework and start building!

## Exports

This package exports the following modules:

- `@devvit/web/server`: Server-side utilities for Devvit web applications, including Redis clients,
  access to the Reddit API, and more.
- `@devvit/web/client`: Client-side utilities for Devvit web applications, including access to our
  client-side context, effects, and more.
  - **NOTE:** If you are having difficulty importing from this package, you may need to
    set `compilerOptions.customConditions` to `["browser"]` in your `tsconfig.json` file. (This
    should be done for you automatically if you used one of our starter templates.)
- `@devvit/web/shared`: Shared utilities and types for Devvit web applications - usable on both
  the client and server.

## Other packages

All the functionality in this package is also available in the following packages:

- `@devvit/client`: Client-side utilities for Devvit web applications.
- `@devvit/media`: Media-related utilities for Devvit web applications.
- `@devvit/realtime`: Realtime communication utilities for Devvit web applications.
- `@devvit/reddit`: Reddit API client for Devvit web applications.
- `@devvit/redis`: Redis client for Devvit web applications.
- `@devvit/scheduler`: Scheduler utilities for Devvit web applications.
- `@devvit/server`: Server-side utilities for Devvit web applications.
- `@devvit/settings`: Settings management utilities for Devvit web applications.
- `@devvit/shared`: Shared utilities and types for Devvit web applications - usable on both
  the client and server.

One single `@devvit/web` dependency replaces all of these packages, so you can use it to
build your web application without needing to install or manage multiple packages.

However, _not_ included here is the following package:

- `@devvit/payments`: Payment-related utilities for Devvit web applications. Once your app has been
  approved to handle payments, you can use this package to handle payments in your web application.

Sign up for Reddit's Developer Platform [here!](https://developers.reddit.com)
