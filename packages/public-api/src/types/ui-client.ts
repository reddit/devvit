import type { JSONObject } from '@devvit/shared-types/json.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';
import type { Comment, Post, Subreddit, User } from '../apis/reddit/models/index.js';
import type { Toast } from './toast.js';

/**
 * The UI client lets your app interact with the Reddit frontend.
 * This client will only be available for capabilities that have
 * a frontend component, such as within the Custom Post component's
 * event handlers, a Form's `onSubmit` handler, and Menu items.
 */
export type UIClient = {
  /** Open a form in a modal */
  showForm(formKey: FormKey, data?: JSONObject | undefined): void;
  /** Show a message in a toast. */
  showToast(text: string): void;
  showToast(toast: Toast): void;
  /** Navigate to a URL */
  navigateTo(url: string): void;
  navigateTo(subreddit: Subreddit): void;
  navigateTo(post: Post): void;
  navigateTo(comment: Comment): void;
  navigateTo(user: User): void;
  navigateTo(urlOrThing: string | Subreddit | Post | Comment | User): void;
};
