export const APP_ACCOUNT_NAME_LENGTH_LIMIT = 20;
export const UNIQUE_SLUG_SUFFIX_LENGTH = 3;

// -1 for the dash between the slug and the suffix
export const APP_SLUG_BASE_MIN_LENGTH = 3;
export const APP_SLUG_BASE_MAX_LENGTH =
  APP_ACCOUNT_NAME_LENGTH_LIMIT - UNIQUE_SLUG_SUFFIX_LENGTH - 1;

const ALLOWED_SLUG_REGEX = /^[a-z][a-z0-9-]*$/;

/**
 * Returns a string describing why the input is not sluggable, or undefined if it is sluggable.
 *
 * @example
 * ```tsx
 * const err = validateSluggable('My App 1');
 * if (err) {
 *   throw new Error(`App name is not valid. (${err})`);
 * }
 * const slug = makeSlug('My App 1'); // 'my-app-1'
 * ```
 */
export function validateSluggable(str: string): string | undefined {
  const slug = str.replace(/\s+/g, '-').toLowerCase();
  if (slug.length < APP_SLUG_BASE_MIN_LENGTH) {
    return `name length must be longer than ${APP_SLUG_BASE_MIN_LENGTH} characters; length: ${slug.length}`;
  }
  if (slug.length > APP_SLUG_BASE_MAX_LENGTH) {
    return `name length must be shorter than ${APP_SLUG_BASE_MAX_LENGTH} characters; length: ${slug.length}`;
  }
  if (!ALLOWED_SLUG_REGEX.test(slug)) {
    return `invalid characters; only use a-z, 0-9, and -`;
  }
  if (slug.includes('reddit')) {
    return `name cannot contain the word "reddit"`;
  }
}

export function makeSlug(str: string): string {
  const err = validateSluggable(str);
  if (err) {
    throw new Error(`App name is not valid. (${err})`);
  }
  return str.replace(/\s+/g, '-').toLowerCase();
}
