import { describe, expect, it } from 'vitest';

import { resolveNavigationInput } from './thing-navigation.js';

describe('resolveNavigationInput', () => {
  it('passes a string through unchanged', () => {
    expect(resolveNavigationInput('https://example.com/foo')).toBe('https://example.com/foo');
  });

  it('returns url as-is when permalink is absent', () => {
    expect(resolveNavigationInput({ url: 'https://example.com/foo' })).toBe(
      'https://example.com/foo'
    );
  });

  it('returns url for a self post on production (pathname matches permalink)', () => {
    const result = resolveNavigationInput({
      permalink: '/r/foo/comments/abc/title/',
      url: 'https://www.reddit.com/r/foo/comments/abc/title/',
    });
    expect(result).toBe('https://www.reddit.com/r/foo/comments/abc/title/');
  });

  it('returns url for a self post on Snoodev (preserves snoodev origin)', () => {
    const result = resolveNavigationInput({
      permalink: '/r/foo/comments/abc/title/',
      url: 'https://reddit.dev.snoo.dev/r/foo/comments/abc/title/',
    });
    expect(result).toBe('https://reddit.dev.snoo.dev/r/foo/comments/abc/title/');
  });

  it('falls back to permalink + www.reddit.com for an image post', () => {
    const result = resolveNavigationInput({
      permalink: '/r/foo/comments/abc/title/',
      url: 'https://i.redd.it/foo.jpg',
    });
    expect(result).toBe('https://www.reddit.com/r/foo/comments/abc/title/');
  });

  it('falls back to permalink + www.reddit.com for a link post', () => {
    const result = resolveNavigationInput({
      permalink: '/r/foo/comments/abc/title/',
      url: 'https://example.com/article',
    });
    expect(result).toBe('https://www.reddit.com/r/foo/comments/abc/title/');
  });

  it('returns url for a Subreddit (pathname matches permalink)', () => {
    const result = resolveNavigationInput({
      permalink: '/r/foo',
      url: 'https://www.reddit.com/r/foo',
    });
    expect(result).toBe('https://www.reddit.com/r/foo');
  });

  it('returns url for a User (pathname matches permalink)', () => {
    const result = resolveNavigationInput({
      permalink: '/user/testuser',
      url: 'https://www.reddit.com/user/testuser',
    });
    expect(result).toBe('https://www.reddit.com/user/testuser');
  });

  it('falls back when url is malformed', () => {
    const result = resolveNavigationInput({
      permalink: '/r/foo/comments/abc/title/',
      url: 'not-a-url',
    });
    expect(result).toBe('https://www.reddit.com/r/foo/comments/abc/title/');
  });
});
