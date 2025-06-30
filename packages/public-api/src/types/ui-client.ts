import type { Form } from '@devvit/shared/types/form.js';
import type { JSONObject } from '@devvit/shared-types/json.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';

import type { Comment, Post, Subreddit, User } from '../apis/reddit/models/index.js';
import type { Toast } from './toast.js';
import type { WebViewUIClient } from './web-view-ui-client.js';

/**
 * The UI client lets your app interact with the Reddit frontend.
 * This client will only be available for capabilities that have
 * a frontend component, such as within the Custom Post component's
 * event handlers, a Form's `onSubmit` handler, and Menu items.
 */
export type UIClient = {
  /** Interact with WebView blocks */
  webView: WebViewUIClient;

  /** Open a form in a modal */
  showForm(formKey: FormKey, data?: JSONObject | undefined): void;
  /** Internal use only. */
  showFormInternal(
    formKey: FormKey,
    data?: JSONObject | undefined,
    formDataOverride?: Form | undefined
  ): void;
  /** Show a message in a toast. */
  showToast(text: string): void;
  showToast(toast: Toast): void;
  showToast(textOrToast: string | Toast): void;
  /** Navigate to a URL */
  navigateTo(url: string): void;
  navigateTo(subreddit: Pick<Subreddit, 'url'>): void;
  navigateTo(post: Pick<Post, 'url'>): void;
  navigateTo(comment: Pick<Comment, 'url'>): void;
  navigateTo(user: Pick<User, 'url'>): void;
  navigateTo(urlOrThing: string | { url: string }): void;
};
