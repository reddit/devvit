export function getSubredditNameWithoutPrefix(subreddit: string): string {
  return subreddit.trim().replace(/^\/?r\//, '');
}
