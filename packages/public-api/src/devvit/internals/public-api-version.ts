/**
 * @devvit/public-api version. Eg, '1.2.3', '0.11.0-dev',
 * '0.10.23-next-2024-07-30-8bdb131a7.0'. This is a user input and may be
 * invalid.
 *
 * Defined by ESBuildPack. to-do: replace with JSON import once Node.js v18
 * support is dropped:
 *
 *   // version.json is a symlink to public-api/package.json.
 *   import pkg from '../../version.json' with { type: 'json' };
 */
export const PUBLIC_API_VERSION: string = '{{version}}';
