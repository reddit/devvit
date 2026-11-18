import type { JsonObject } from '@devvit/shared-types/json.js';
import type { Form, FormValues } from '@devvit/shared-types/shared/form.js';

/**
 * Response format that can be returned from menu action handlers and form handlers.
 *
 * This will create client-side UI effects in Reddit clients as responses to user
 * actions in cases where the Devvit app is not in the direct code path.
 */
export type UiResponse<InitFormData extends JsonObject = JsonObject> = {
  /** Navigate the user's reddit client to this URL or Reddit Thing (Post, Subreddit, etc)
   */
  navigateTo?: string | { url: string; permalink?: string };
  /** Show a toast to the user's reddit client. */
  showToast?: string | Toast;
  /** Display a form in the user's reddit client. */
  showForm?: ShowForm<InitFormData>;
  /**
   * Open a Devvit web view surface for a `post.entrypoints` key, without a
   * backing post. Pass the entrypoint name, or a `ShowWebView` for more
   * options. Cannot be combined with `navigateTo` or `showForm`, but may
   * accompany `showToast`.
   *
   * @experimental
   */
  showWebView?: string | ShowWebView;
};

/**
 * Options for opening a Devvit web view surface from a menu or form endpoint.
 *
 * @experimental
 */
export type ShowWebView = {
  /** The devvit.json `post.entrypoints` key to open. Defaults to "default". */
  entrypointName?: string;
  /** How the web view is presented. Defaults to "modal". */
  presentation?: 'fullscreen' | 'modal';
};

export type ShowForm<InitFormData extends JsonObject> = {
  /** Name of the form. This must match a configured form in devvit.json. */
  name: string;
  /** Specification for the form to display to the user */
  form: Form;
  /** Data to initially populate form fields with */
  data?: FormValues<InitFormData> | undefined;
};

export type Toast = {
  /** The message shown within the toast */
  text: string;
  /** The appearance of the toast */
  appearance?: 'neutral' | 'success';
};
