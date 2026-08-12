import type { Metadata } from '@devvit/protos/lib/Types.js';
import { Context, runWithContext } from '@devvit/server';
import type { DevvitRpc, ExtendDevvitPrototype } from '@devvit/shared-types/devvit-rpc.js';

import { Devvit } from '../../Devvit.js';

// to-do: ask for a whole service and assign that to the prototype instead. Most
//        usages do not want a partial service implementation and the typing for
//        that is clumsy anyway.
/**
 * Installs an RPC handler on the `Devvit` actor and initializes
 * `@devvit/server` context before invoking it. Compute's `PerRequestStore`
 * uses a separate `AsyncLocalStorage` instance and does not initialize this
 * context.
 *
 * RPC flow: compute `PerRequestStore` ALS -> RPC ingress -> this wrapper ->
 * `@devvit/server` ALS -> registered RPC implementation.
 * @internal
 */
export const extendDevvitPrototype: ExtendDevvitPrototype = (key, value) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (Devvit as Function).prototype[key] = rpcWithContext(value);
};

function rpcWithContext(rpc: DevvitRpc): DevvitRpc {
  return function wrappedHandler(this: unknown, req: never, meta?: Metadata) {
    const ctx = Context(metadataToHeaders(meta ?? {}));
    return runWithContext(ctx, async () => await rpc.call(this, req, meta));
  };
}

function metadataToHeaders(meta: Readonly<Metadata>): { [k: string]: string[] } {
  return Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, v.values]));
}
