// eslint-disable-next-line no-restricted-imports
import type { Definition } from '@devvit/protos';
// eslint-disable-next-line no-restricted-imports
import type { SerializableServiceDefinition } from '@devvit/protos/types/devvit/runtime/serializable.js';

import type { Namespace } from './Namespace.js';

/** Actor in the platform, not in a user Bundle. */
export const PLUGIN_NAME: string = 'default';

/** Actor in the platform, not in a user Bundle. */
export const PLUGIN_OWNER: string = 'devvit';

export const LOCAL_HOSTNAME: string = 'local';
export const NODE_HOSTNAME = 'node';

export const REDDIT_API_CNAME = 'redditapi';

export function resolveActorHostname(name: string, namespace: Readonly<Namespace>): string {
  return childHostname(name, namespace);
}

export function resolvePluginDefinitionHostname(
  definition: Readonly<Definition | SerializableServiceDefinition>,
  namespace: Readonly<Namespace>
): string {
  return resolvePluginHostname(definition.name, namespace);
}

export function resolveSystemHostname(name: string, namespace: Readonly<Namespace>): string {
  return childHostname(name, getSystemNamespace(namespace));
}

/**
 * Forms a hostname under namespace. Eg:
 *
 *   123, abc.local → 123.abc.local
 *   123, local → 123.local
 */
function childHostname(name: string, namespace: Readonly<Namespace>): string {
  if (namespace.hostname == null) throw Error('Unbound namespace.');
  return `${name}.${namespace.hostname}`.toLocaleLowerCase();
}

function getPluginNamespace(namespace: Readonly<Namespace>): Namespace {
  return { hostname: childHostname('plugins', namespace) };
}

function getSystemNamespace(namespace: Readonly<Namespace>): Namespace {
  return { hostname: childHostname('system', namespace) };
}

function resolvePluginHostname(name: string, namespace: Readonly<Namespace>): string {
  return childHostname(name, getPluginNamespace(namespace));
}
