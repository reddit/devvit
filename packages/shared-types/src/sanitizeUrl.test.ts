import { expect } from 'vitest';

import { isCleanUrl, sanitizeUrl } from './sanitizeUrl.js';

describe('sanitizeUrl', () => {
  it('should be happy with a valid https url', () => {
    const url = 'https://example.com';
    expect(sanitizeUrl(url)).toEqual(url);
    expect(isCleanUrl(url)).toEqual(true);
  });
  it('should be happy with a valid http url', () => {
    const url = 'http://example.com';
    expect(sanitizeUrl(url)).toEqual(url);
    expect(isCleanUrl(url)).toEqual(true);
  });
  it('should be happy with a valid ftp url', () => {
    const url = 'ftp://example.com';
    expect(sanitizeUrl(url)).toEqual(url);
    expect(isCleanUrl(url)).toEqual(true);
  });
  it('should be unhappy with a javascript url', () => {
    const url = 'javascript:alert(1)';
    expect(sanitizeUrl(url)).toBeUndefined();
    expect(isCleanUrl(url)).toEqual(false);
  });
  it('should give back a blank url when given blank url', () => {
    const url = '';
    expect(sanitizeUrl(url)).toBe('');
    expect(isCleanUrl(url)).toEqual(true);
  });
});
