import type { BaseContext } from '../shared/baseContext.js';
import type { Client } from '../shared/client.js';
import type { T2, T3 } from '../tid.js';

/**
 * Devvit web client context for the lifetime of the web view.
 */
export type Context = BaseContext & {
  // to-do: Move to BaseContext. The server should be able to use the existing
  //        `devvit-user-agent` header to extract client detail. See
  //        https://github.com/reddit/devvit-paint-tv/blob/0742302/src/devvit/hooks/use-session.ts#L34-L35.
  /** Details about the platform the app was invoked from. */
  client: Client | undefined;

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
