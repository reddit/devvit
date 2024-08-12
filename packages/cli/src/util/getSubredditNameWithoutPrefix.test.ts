import { getSubredditNameWithoutPrefix } from '../util/common-actions/getSubredditNameWithoutPrefix.js';

describe('getSubredditNameWithoutPrefix', () => {
  test('subreddit string with a prefix is returned correctly without prefix', () => {
    const input: string = 'r/subreddit';
    expect(getSubredditNameWithoutPrefix(input)).toBe('subreddit');

    const input2: string = '/r/subreddit';
    expect(getSubredditNameWithoutPrefix(input2)).toBe('subreddit');
  });

  test('subreddit string with whitespace before or after arg is returned correctly without prefix', () => {
    const input: string = ' subreddit';
    expect(getSubredditNameWithoutPrefix(input)).toBe('subreddit');

    const input2: string = 'subreddit ';
    expect(getSubredditNameWithoutPrefix(input2)).toBe('subreddit');
  });

  test('subreddit string no prefix is returned correctly without prefix', () => {
    const input: string = 'subreddit';
    expect(getSubredditNameWithoutPrefix(input)).toBe('subreddit');
  });
});
