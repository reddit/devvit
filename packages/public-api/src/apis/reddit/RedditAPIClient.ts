import {
  type Comment,
  type CommentSubmissionOptions,
  type CrosspostOptions,
  type Post,
  RedditClient,
  type Subreddit,
  type SubredditInfo,
  type SubredditLeaderboard,
  type SubredditStyles,
  type User,
  type Vault,
} from '@devvit/reddit';
import { context } from '@devvit/server';

import { asTID, type T1ID, type T2ID, type T3ID, type T5ID } from '../../types/tid.js';

export type { Oembed as OEmbed } from '@devvit/reddit';

export class RedditAPIClient extends RedditClient {
  override getSubredditById(id: string): Promise<Subreddit | undefined> {
    return super.getSubredditById(asTID<T5ID>(id));
  }

  override getSubredditInfoById(id: string): Promise<SubredditInfo> {
    return super.getSubredditInfoById(asTID<T5ID>(id));
  }

  override getPostById(id: string): Promise<Post> {
    return super.getPostById(asTID<T3ID>(id));
  }

  override crosspost(
    options: Omit<CrosspostOptions, 'postId'> & { postId: string }
  ): Promise<Post> {
    return super.crosspost({
      ...options,
      postId: asTID<T3ID>(options.postId),
    });
  }

  override getUserById(id: string): Promise<User | undefined> {
    return super.getUserById(asTID<T2ID>(id));
  }

  override async getAppUser(): Promise<User> {
    const user = await super.getAppUser();
    if (!user) {
      throw new Error("Couldn't get app user");
    }
    return user;
  }

  override getCommentById(id: string): Promise<Comment> {
    return super.getCommentById(asTID<T1ID>(id));
  }

  override submitComment(options: CommentSubmissionOptions & { id: string }): Promise<Comment> {
    return super.submitComment({
      ...options,
      id: asTID<T1ID | T3ID>(options.id),
    });
  }

  override approve(id: string): Promise<void> {
    return super.approve(asTID<T1ID | T3ID>(id));
  }

  override remove(id: string, isSpam: boolean): Promise<void> {
    return super.remove(asTID<T1ID | T3ID>(id), isSpam);
  }

  override removePostFlair(subredditName: string, postId: string): Promise<void> {
    return super.removePostFlair(subredditName, asTID<T3ID>(postId));
  }

  override getVaultByUserId(userId: string): Promise<Vault> {
    return super.getVaultByUserId(asTID<T2ID>(userId));
  }

  override getSubredditLeaderboard(subredditId: string): Promise<SubredditLeaderboard> {
    return super.getSubredditLeaderboard(asTID<T5ID>(subredditId));
  }

  override getSubredditStyles(subredditId: string): Promise<SubredditStyles> {
    return super.getSubredditStyles(asTID<T5ID>(subredditId));
  }

  /**
   * Retrieves the name of the current subreddit.
   *
   * @returns {Promise<string>} A Promise that resolves a string representing the current subreddit's name.
   * @example
   * ```ts
   * const currentSubredditName = await reddit.getCurrentSubredditName();
   * ```
   */
  async getCurrentSubredditName(): Promise<string> {
    return context.subredditName;
  }
}

/** @internal */
export const reddit: RedditAPIClient = new RedditAPIClient();
