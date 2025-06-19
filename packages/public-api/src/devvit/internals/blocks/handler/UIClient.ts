import { EffectType, Form, type Toast as ToastProto, ToastAppearance } from '@devvit/protos';
import type { JSONObject, JSONValue } from '@devvit/shared-types/json.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';

import type { Comment, Post, Subreddit, User } from '../../../../apis/reddit/models/index.js';
import { assertValidFormFields } from '../../../../apis/ui/helpers/assertValidFormFields.js';
import { transformFormFields } from '../../../../apis/ui/helpers/transformForm.js';
import type { Toast } from '../../../../types/toast.js';
import type { UIClient as _UIClient } from '../../../../types/ui-client.js';
import type { WebViewUIClient } from '../../../../types/web-view-ui-client.js';
import { _activeRenderContext } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';
import { getFormDefinition } from './useForm.js';

export function useUI(): _UIClient {
  const renderContext = _activeRenderContext;
  if (!renderContext) {
    throw new Error('useUI can only be called from within the top level of a component.');
  }
  return new UIClient(renderContext);
}

export class UIClient implements _UIClient {
  readonly #renderContext: RenderContext;
  // Auto-incrementing count of the number of WebviewMessage effects called this frame.
  // Used as part of the dedup key for emitEvent to prevent messages from being dedup'd.
  #webViewMessageCount: number = 0;
  readonly #webViewClient: WebViewUIClient;

  constructor(renderContext: RenderContext) {
    this.#renderContext = renderContext;
    this.#webViewClient = {
      postMessage: this.#webViewPostMessage,
    };
  }

  get webView(): WebViewUIClient {
    return this.#webViewClient;
  }

  showForm(formKey: FormKey, data?: JSONObject | undefined): void {
    const formDefinition = getFormDefinition(this.#renderContext, formKey);

    if (!formDefinition) {
      throw new Error('Form does not exist. Make sure you have added it using useForm.');
    }

    const formData =
      formDefinition.form instanceof Function
        ? formDefinition.form(data ?? {})
        : formDefinition.form;

    const form: Form = {
      fields: [],
      id: formKey,
      title: formData.title,
      acceptLabel: formData.acceptLabel,
      cancelLabel: formData.cancelLabel,
      shortDescription: formData.description,
    };

    assertValidFormFields(formData.fields);
    form.fields = transformFormFields(formData.fields);

    this.#renderContext.emitEffect(formKey, {
      type: EffectType.EFFECT_SHOW_FORM,
      showForm: {
        form,
      },
    });
  }

  showToast(text: string): void;
  showToast(toast: Toast): void;
  showToast(textOrToast: string | Toast): void {
    let toast: ToastProto;

    if (textOrToast instanceof Object) {
      toast = {
        text: textOrToast.text,
        appearance:
          textOrToast.appearance === 'success' ? ToastAppearance.SUCCESS : ToastAppearance.NEUTRAL,
      };
    } else {
      toast = {
        text: textOrToast,
      };
    }

    this.#renderContext.emitEffect(textOrToast.toString(), {
      type: EffectType.EFFECT_SHOW_TOAST,
      showToast: {
        toast,
      },
    });
  }

  navigateTo(url: string): void;
  navigateTo(subreddit: Subreddit): void;
  navigateTo(post: Post): void;
  navigateTo(comment: Comment): void;
  navigateTo(user: User): void;
  navigateTo(thingOrUrl: string | Subreddit | Post | Comment | User): void {
    let url: string;

    if (typeof thingOrUrl === 'string') {
      // Validate URL
      url = new URL(thingOrUrl).toString();
    } else {
      url = new URL(thingOrUrl.url).toString();
    }
    this.#renderContext.emitEffect(url, {
      type: EffectType.EFFECT_NAVIGATE_TO_URL,
      navigateToUrl: {
        url,
      },
    });
  }

  #webViewPostMessage: WebViewUIClient['postMessage'] = <T extends JSONValue>(
    webViewIdOrMessage: string | T,
    message?: T | undefined
  ): void => {
    const webViewId = message !== undefined ? (webViewIdOrMessage as string) : '';
    const msg = message !== undefined ? message : webViewIdOrMessage;
    this.#renderContext.emitEffect(`postMessage${this.#webViewMessageCount++}`, {
      type: EffectType.EFFECT_WEB_VIEW,
      webView: {
        postMessage: {
          webViewId,
          app: {
            message: msg, // This is deprecated, but populated for backwards compatibility
            jsonString: JSON.stringify(msg), // Encode as JSON for consistency with the mobile clients
          },
        },
      },
    });
  };
}
