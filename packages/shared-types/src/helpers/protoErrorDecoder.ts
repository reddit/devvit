// eslint-disable-next-line no-restricted-imports
import { Any } from '@devvit/protos/types/google/protobuf/any.js';
// eslint-disable-next-line no-restricted-imports
import { StringValue } from '@devvit/protos/types/google/protobuf/wrappers.js';

/**
 * Decodes error messages from protobuf Any types wrapping StringValue.
 */
export function decodeProtoErrors(errors: readonly Any[]): string[] {
  return errors.map((err) => {
    try {
      const decoded = StringValue.decode(err.value);
      return decoded.value;
    } catch {
      // Fallback to stringify if decoding fails
    }
    return JSON.stringify(err);
  });
}
