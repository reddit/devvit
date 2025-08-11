import '@devvit/web-view-scripts/init-context.js';

import { type Context } from '@devvit/web-view-scripts/init-context.js';

export const context: Context = new Proxy<Context>({} as Context, {
  get: (_target, prop: keyof Context) => {
    return globalThis.devvit.context[prop];
  },
  // The following two methods set up the Proxy to behave like a normal object when iterating over keys or
  // checking if a property exists. (This helps ensure tests pass too.)
  ownKeys(): string[] {
    return Object.keys(globalThis.devvit.context);
  },
  getOwnPropertyDescriptor(_target, key: keyof Context) {
    return { enumerable: true, configurable: true, value: globalThis.devvit.context[key] };
  },
});
