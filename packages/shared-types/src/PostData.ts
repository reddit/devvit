import type { JsonObject } from './json.js';

/**
 * Post data included in the current post.
 * This data is set at custom Post creation via `submitPost({ postData: {...} })` and can be updated via `Post.setPostData({...})`.
 * If there is no post data specified, the value is undefined.
 */
export type PostData = JsonObject;
