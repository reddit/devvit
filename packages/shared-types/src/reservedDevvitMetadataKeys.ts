type ReservedDevvitMetadataKey = `devvit-${string}`;
export const RESERVED_DEVVIT_METADATA_PREFIX: ReservedDevvitMetadataKey = 'devvit-';

/**
 * Determines if a key is a reserved metadata key - i.e. it starts with 'devvit-'.
 */
export function isDevvitMetadataKey(key: string): key is ReservedDevvitMetadataKey {
  return key.startsWith(RESERVED_DEVVIT_METADATA_PREFIX);
}

/**
 * Returns a filtered list of all keys that are reserved metadata keys - i.e. they start with 'devvit-'.
 * ['devvit-foo', 'color'] => ['devvit-foo']
 */
export function filterToReservedDevvitMetadataKeys(keys: string[]): ReservedDevvitMetadataKey[] {
  return keys.filter(isDevvitMetadataKey);
}

/**
 * Removes reserved metadata keys from a metadata object and returns an object with only the non-reserved keys.
 */
export function purgeReservedDevvitKeysFromMetadata<T extends Record<string, string>>(
  metadata: T
): Record<Exclude<string, ReservedDevvitMetadataKey>, string> {
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !isDevvitMetadataKey(key)));
}
