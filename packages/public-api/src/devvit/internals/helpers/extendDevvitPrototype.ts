import type { Metadata } from '@devvit/protos/lib/Types.js';
import { Context, runWithContext } from '@devvit/server';

import { Devvit } from '../../Devvit.js';

type Rpc = (req: never, meta: Metadata) => Promise<unknown>;

/** keyof T if RPC. */
type RpcKey<T> = {
  [K in keyof T]: T[K] extends Rpc ? K : never;
}[keyof T];

// to-do: ask for a whole service and assign that to the prototype instead. Most
//        usages do not want a partial service implementation and the typing for
//        that is clumsy anyway.
export function extendDevvitPrototype<T extends Record<K, Rpc>, K extends RpcKey<T> = RpcKey<T>>(
  key: K,
  value: T[K]
): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (Devvit as Function).prototype[key] = rpcWithContext(value);
}

function rpcWithContext(rpc: Rpc): Rpc {
  return function wrappedHandler(this: unknown, ...args: Parameters<Rpc>) {
    const meta = args[1] ?? {};
    const ctx = Context(metadataToHeaders(meta));
    return runWithContext(ctx, async () => await rpc.apply(this, args));
  };
}

function metadataToHeaders(meta: Metadata): { [k: string]: string[] } {
  return Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, v.values]));
}
