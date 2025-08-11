import type { PostData } from '@devvit/shared-types/PostData.js';
import type { T2, T3, T5 } from '@devvit/shared-types/tid.js';

export type BaseContext = {
  /** The ID of the current subreddit */
  subredditId: T5;
  /** The name of the current subreddit */
  subredditName: string;
  /** The current user's ID, if there is one; logged out users will be `undefined` */
  userId: T2 | undefined;
  /** The slug of the app that is running */
  appName: string;
  /** The version of the app that is running */
  appVersion: string;
  /**
   * The ID of the current post, if applicable. If there's no post related to what
   * we're doing, this is `undefined`.
   */
  postId: T3 | undefined;
  /**
   * Post data included in the current post.
   * This data is set at custom Post creation via `submitPost({ postData: {...} })` and can be updated via `Post.setPostData({...})`.
   * If there is no post data specified, the value is undefined.
   */
  postData?: PostData | undefined;
};
