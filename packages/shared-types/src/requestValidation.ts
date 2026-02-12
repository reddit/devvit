type ErrorFactory<TError extends Error> = (message: string) => TError;

export function requireNonEmptyString<TError extends Error>(
  value: string,
  key: string,
  createError: ErrorFactory<TError>
): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw createError(`${key} must be a non-empty string.`);
  }
  return trimmedValue;
}

export function requirePositiveInteger<TError extends Error>(
  value: number,
  key: string,
  createError: ErrorFactory<TError>
): number {
  if (!Number.isInteger(value) || value < 1) {
    throw createError(`${key} must be a positive integer.`);
  }
  return value;
}
