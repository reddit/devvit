import type { BaseContext } from '../shared/baseContext.js';
import type { T2, T3 } from '../tid.js';

/**
 * Devvit web client context for the lifetime of the web view.
 */
export type Context = BaseContext & {
  // to-do: move to BaseContext once support by server. Remove experimental once
  //        `RequestContext` is used on all clients.
  /**
   * The post author user ID, if applicable to the context and the account is
   * active.
   * @experimental
   */
  postAuthorId: T2 | undefined;
  /**
   * The ID of the current post.
   */
  postId: T3;
};
