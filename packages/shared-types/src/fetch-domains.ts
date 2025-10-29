// Regular expression to check if a domain contains a top-level domain, eg '.com' or '.org'
const TOP_LEVEL_DOMAIN_REGEX = /\.[a-zA-Z]{2,}$/;
const MAX_DOMAINS = 25;

/**
 * Asserts that the number of requested fetch domains is within the allowed limit.
 * @param requestedFetchDomains - The array of requested fetch domains.
 * @throws Error if the number of domains exceeds the limit.
 */
export function assertRequestedFetchDomainsLimit(requestedFetchDomains: string[]): void {
  if (requestedFetchDomains.length > MAX_DOMAINS) {
    throw new Error(`The size of requestedFetchDomains is limited to ${MAX_DOMAINS} domains.`);
  }
}

/**
 * Normalizes the requested fetch domains by removing the protocol and 'www' prefix if present.
 * @param requestedFetchDomains - The array of requested fetch domains.
 * @returns An array of normalized domains.
 * @throws Error if any domain format is invalid.
 */
export function normalizeDomains(requestedFetchDomains: string[]): string[] {
  const normalizedSet = new Set<string>();

  for (let rawDomain of requestedFetchDomains) {
    try {
      // Check for valid TLD (like '.com', '.net', etc.)
      if (!TOP_LEVEL_DOMAIN_REGEX.test(rawDomain)) {
        throw new Error(`The domain does not have a valid top-level domain.`);
      }

      // Prepend 'http://' if no protocol is present
      if (!rawDomain.includes('://')) {
        rawDomain = 'http://' + rawDomain;
      }

      // Create URL object and extract hostname
      const url = new URL(rawDomain);
      const normalizedDomain = url.hostname.replace(/^www\./, ''); // Remove 'www.' prefix

      normalizedSet.add(normalizedDomain);
    } catch (error) {
      throw new Error(
        `Failed to determine hostname from requested domain: '${rawDomain}'. ${error}`
      );
    }
  }

  return Array.from(normalizedSet);
}
