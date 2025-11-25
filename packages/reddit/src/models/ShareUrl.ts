import { GraphQL } from '../graphql/GraphQL.js';

/** @internal */
export async function createShareUrl(url: string): Promise<string> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(
      'Invalid URL. Provide an absolute URL such as https://reddit.com/r/gamesonreddit.'
    );
  }

  // Ensure the URL domain is reddit.com or old.reddit.com
  const allowedDomains = new Set(['reddit.com', 'www.reddit.com', 'old.reddit.com']);
  if (!allowedDomains.has(parsedUrl.hostname)) {
    throw new Error(
      'Invalid domain. Only reddit.com, www.reddit.com, and old.reddit.com URLs are supported.'
    );
  }

  // Ensure the URL has a non-root path and starts with an allowed prefix
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '') {
    throw new Error('Cannot shorten reddit.com. Must include a path such as /r/ or /u/.');
  }

  // I don't know what /x/ is, but it is technically valid so I included it but left off the error message.
  const allowedPrefixes = ['/r/', '/u/', '/x/'];
  if (!allowedPrefixes.some((prefix) => parsedUrl.pathname.startsWith(prefix))) {
    throw new Error('Only reddit.com URLs under /r/ or /u/ are supported.');
  }

  // Fail fast: the service only accepts these query params; others are not supported
  const allowedParams = new Set(['utm_source', 'utm_medium', 'devvitshare']);
  const disallowedParams = Array.from(parsedUrl.searchParams.keys()).filter(
    (key) => !allowedParams.has(key)
  );
  if (disallowedParams.length > 0) {
    const uniqueDisallowed = Array.from(new Set(disallowedParams)).sort();
    throw new Error(
      `Unsupported query parameters: ${uniqueDisallowed.join(
        ', '
      )}. Allowed query params are: ${Array.from(allowedParams).join(', ')}. Remove other params and try again.`
    );
  }

  const operationName = 'CreateShareUrl';
  const persistedQueryHash = 'efe976f272ac5cf720cde4b0e5d1f88ca0e9e18f3401a95d3c048e94ac53eb90';

  // Legacy GQL query. Do not copy this pattern.
  // eslint-disable-next-line no-restricted-properties
  const response = await GraphQL.query(operationName, persistedQueryHash, {
    input: { url },
  });

  const shareUrl = response?.data?.createShareUrl?.shareUrl;

  if (!response?.data?.createShareUrl?.ok || !shareUrl) {
    throw new Error('Unable to create a share URL. Please try again later.');
  }

  return shareUrl;
}
