import type { JsonObject } from '@devvit/shared-types/json.js';

import type { Form, FormValues } from './form.js';

/**
 * Response format that can be returned from menu action handlers and form handlers.
 *
 * This will create client-side UI effects in Reddit clients as responses to user
 * actions in cases where the Devvit app is not in the direct code path.
 */
export type UiResponse<InitFormData extends JsonObject = JsonObject> = {
  /** Navigate the user's reddit client to this URL or Reddit Thing (containing `url`). */
  navigateTo?: string | { url: string };
  /** Show a toast to the user's reddit client. */
  showToast?: string | Toast;
  /** Display a form in the user's reddit client. */
  showForm?: {
    /** Name of the form. This must match a configured form in devvit.json. */
    name: string;
    /** Specification for the form to display to the user */
    form: Form;
    /** Data to initially populate form fields with */
    data?: FormValues<InitFormData> | undefined;
  };
};

export type Toast = {
  /** The message shown within the toast */
  text: string;
  /** The appearance of the toast */
  appearance?: 'neutral' | 'success';
};
