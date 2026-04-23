/** Minimum length for an app display name (human-readable name in the dev portal). */
export const APP_DISPLAY_NAME_MIN_LENGTH = 3;

/** Maximum length for an app display name (human-readable name in the dev portal). */
export const APP_DISPLAY_NAME_MAX_LENGTH = 90;

/**
 * Returns an error message if the display name length is invalid, or undefined if valid.
 * Uses trimmed length so leading/trailing whitespace does not count toward the limit.
 */
export function getAppDisplayNameLengthError(name: string): string | undefined {
  const trimmed = name.trim();
  if (trimmed.length < APP_DISPLAY_NAME_MIN_LENGTH) {
    return `Display name must be between ${APP_DISPLAY_NAME_MIN_LENGTH} and ${APP_DISPLAY_NAME_MAX_LENGTH} characters.`;
  }
  if (trimmed.length > APP_DISPLAY_NAME_MAX_LENGTH) {
    return `Display name must be between ${APP_DISPLAY_NAME_MIN_LENGTH} and ${APP_DISPLAY_NAME_MAX_LENGTH} characters.`;
  }
  return undefined;
}
