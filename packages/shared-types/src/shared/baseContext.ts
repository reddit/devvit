import type { PostData } from '../PostData.js';
import type { T2, T3, T5 } from '../tid.js';

/** Client or server request context. */
export type BaseContext = {
  /** The ID of the current subreddit. */
  subredditId: T5;
  /** The name of the current subreddit. */
  subredditName: string;
  /** The current user's ID, if logged in. */
  userId: T2 | undefined;
  /**
   * The slug of the app that is running.
   * @deprecated Use {@link BaseContext.appSlug} instead.
   */
  appName: string;
  /** The slug of the app that is running. */
  appSlug: string;
  /** The version of the app that is running. */
  appVersion: string;
  /** The ID of the current post, if applicable to the context. */
  postId: T3 | undefined;
  /**
   * Post data included in the current post.
   * This data is set at custom Post creation via `submitPost({ postData: {...} })` and can be updated via `Post.setPostData({...})`.
   * If there is no post data specified, the value is undefined.
   */
  postData: PostData | undefined;
  // to-do: Remove experimental once `RequestContext` is used on all clients.
  /**
   * The current user's snoovtar URL if logged in.
   * @experimental
   */
  snoovatar: string | undefined;
  // to-do: Remove experimental once `RequestContext` is used on all clients.
  /**
   * The current user's handle if logged in.
   * @experimental
   */
  username: string | undefined;
};
