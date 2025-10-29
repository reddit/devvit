import { assertRequestedFetchDomainsLimit, normalizeDomains } from './fetch-domains.js';

describe('normalizeDomains', () => {
  it('removes protocols, www prefixes, and duplicate domains', () => {
    const input = [
      'https://www.example.com',
      'http://test.org',
      'www.site.net',
      'site.net', // duplicate
      'custom-domain.io',
      'api.mauerstrassenernten.de',
      'https://site.net', // duplicate
    ];
    const expected = [
      'example.com',
      'test.org',
      'site.net',
      'custom-domain.io',
      'api.mauerstrassenernten.de',
    ];
    expect(normalizeDomains(input)).toEqual(expected);
  });

  it('throws an error for missing top-level domain', () => {
    const input = ['https://good.com', 'bad_domain', 'http://www.clean.org'];
    expect(() => normalizeDomains(input)).toThrow(
      "Failed to determine hostname from requested domain: 'bad_domain'. Error: The domain does not have a valid top-level domain."
    );
  });
});

describe('assertRequestedFetchDomainsLimit', () => {
  it('does not throw for 25 or fewer domains', () => {
    const domains = Array.from({ length: 25 }, (_, i) => `https://site${i}.com`);
    expect(() => assertRequestedFetchDomainsLimit(domains)).not.toThrow();
  });

  it('throws for more than 25 domains', () => {
    const domains = Array.from({ length: 26 }, (_, i) => `https://site${i}.com`);
    expect(() => assertRequestedFetchDomainsLimit(domains)).toThrow(
      'The size of requestedFetchDomains is limited to 25 domains.'
    );
  });
});
