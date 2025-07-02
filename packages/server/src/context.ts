import { AsyncLocalStorage } from 'node:async_hooks';

import type { RequestContext } from './request-context.js';

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Gets the current RequestContext. This is set by the server when handling a request. If there is no
 * context, this will throw an error.
 * @returns The current RequestContext.
 * @throws Error Will throw an error if there is no context.
 */
function getContext(): RequestContext {
  const ctx = requestContextStorage.getStore();
  if (!ctx) {
    throw new Error(
      'No context found. Are you calling `createServer` Is this code running as part of a server request?'
    );
  }
  return ctx;
}

/**
 * Runs an async callback with the given RequestContext. Code in the callback can use
 * `getContext()` to get the context.
 * @internal
 * @param context The context to run the callback with
 * @param callback The callback to run
 */
export async function runWithContext<T>(
  context: RequestContext,
  callback: () => Promise<T>
): Promise<T> {
  return requestContextStorage.run(context, callback);
}

export const context = new Proxy<RequestContext>({} as RequestContext, {
  get: (_target, prop: keyof RequestContext) => {
    const context = getContext();
    return context[prop];
  },
  // The following two methods set up the Proxy to behave like a normal object when iterating over keys or
  // checking if a property exists. (This helps ensure tests pass too.)
  ownKeys(): string[] {
    return Object.keys(getContext());
  },
  getOwnPropertyDescriptor(_target, key: keyof RequestContext) {
    return { enumerable: true, configurable: true, value: getContext()[key] };
  },
});
