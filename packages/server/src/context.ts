import { AsyncLocalStorage } from 'node:async_hooks';

import type { Metadata } from '@devvit/protos';

import type { Context } from './server-context.js';

let requestContextStorage: AsyncLocalStorage<Context>;
try {
  requestContextStorage = new AsyncLocalStorage<Context>();
} catch {
  // Hack: workaround inclusion in Blocks client builds.
}

/**
 * Gets the current Context. This is set by the server when handling a request. If there is no
 * context, this will throw an error.
 * @returns The current Context.
 * @throws Error Will throw an error if there is no context.
 */
function getContext(): Context {
  const ctx = requestContextStorage.getStore();
  if (!ctx) {
    throw new Error(
      'No context found. Are you calling `createServer` Is this code running as part of a server request?'
    );
  }
  return ctx;
}

export function getMetadata(): Readonly<Metadata> | undefined {
  const ctx = requestContextStorage.getStore();
  if (!ctx) {
    return undefined;
  }
  return ctx.metadata;
}

/**
 * Runs an async callback with the given Context. Code in the callback can use
 * `getContext()` to get the context. For testing.
 * @experimental
 * @param context The context to run the callback with
 * @param callback The callback to run
 */
export async function runWithContext<T>(context: Context, callback: () => Promise<T>): Promise<T> {
  return requestContextStorage.run(context, callback);
}

export const context = new Proxy<Context>({} as Context, {
  get: (_target, prop: keyof Context) => {
    const context = getContext();
    return context[prop];
  },
  // The following two methods set up the Proxy to behave like a normal object when iterating over keys or
  // checking if a property exists. (This helps ensure tests pass too.)
  ownKeys(): string[] {
    return Object.keys(getContext());
  },
  getOwnPropertyDescriptor(_target, key: keyof Context) {
    return { enumerable: true, configurable: true, value: getContext()[key] };
  },
});

/** For testing. @experimental */
export function setContextCache(key: string, value: unknown): void {
  const context = getContext();
  if (!context.cache) {
    context.cache = {};
  }
  context.cache[key] = value;
}

/** For testing. @experimental */
export function getContextCache<T>(key: string): T | undefined {
  const context = getContext();
  if (!context.cache) {
    return undefined;
  }
  return context.cache[key] as T | undefined;
}
