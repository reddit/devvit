import type { Metadata } from '@devvit/protos/lib/Types.js';

/** An RPC method implemented by the Devvit actor. */
export type DevvitRpc = (request: never, metadata?: Metadata) => Promise<unknown>;

type DevvitRpcKey<Service> = {
  [Key in keyof Service]: Service[Key] extends DevvitRpc ? Key : never;
}[keyof Service];

/** Installs one RPC implementation on the Devvit actor prototype. */
export type ExtendDevvitPrototype = <
  Service extends Record<Key, DevvitRpc>,
  Key extends DevvitRpcKey<Service> = DevvitRpcKey<Service>,
>(
  key: Key,
  value: Service[Key]
) => void;
