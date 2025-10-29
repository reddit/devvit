const ALLOWED_PROTOCOLS = ['http:', 'https:', 'ftp:'];

export function sanitizeUrl(url: string): string;
export function sanitizeUrl(url: string | null | undefined): string | undefined;
export function sanitizeUrl(url: string | null | undefined): string | undefined {
  if (!url) {
    // Empty string should be left alone; falsy should be coerced to undefined
    return url ?? undefined;
  }

  try {
    // Try and parse the URL
    const urlObj = new URL(url);

    // If it starts with a protocol that makes sense, return it - it's clean
    if (ALLOWED_PROTOCOLS.some((protocol) => urlObj.protocol === protocol)) {
      return url;
    }

    // Otherwise, return undefined
    return undefined;
  } catch {
    // If it's not a valid URL, return undefined
    return undefined;
  }
}

export function isCleanUrl(url: string): boolean {
  return sanitizeUrl(url) === url;
}
