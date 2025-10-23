import {
  type Effect,
  EffectType,
  Form as FormProto,
  type Toast as ToastProto,
  ToastAppearance,
} from '@devvit/protos';
import type { Form } from '@devvit/shared';
import type { FormKey } from '@devvit/shared-types/useForm.js';

import { Devvit } from '../../devvit/Devvit.js';
import type { BlocksReconciler } from '../../devvit/internals/blocks/BlocksReconciler.js';
import type { JSONObject, JSONValue } from '../../types/json.js';
import type { Toast } from '../../types/toast.js';
import type { UIClient as _UIClient } from '../../types/ui-client.js';
import type { WebViewUIClient } from '../../types/web-view-ui-client.js';
import type { Comment, Post, Subreddit, User } from '../reddit/models/index.js';
import { assertValidFormFields } from './helpers/assertValidFormFields.js';
import { transformFormFields } from './helpers/transformForm.js';

export class UIClient implements _UIClient {
  readonly #effects: Effect[] = [];
  readonly #reconciler: BlocksReconciler | undefined;
  readonly #webViewClient: WebViewUIClient;

  constructor(reconciler?: BlocksReconciler) {
    this.#reconciler = reconciler;
    this.#webViewClient = {
      postMessage: this.#postMessage,
    };
  }

  get webView(): WebViewUIClient {
    return this.#webViewClient;
  }

  showForm(formKey: FormKey, data?: JSONObject | undefined): void {
    return this.showFormInternal(formKey, data);
  }

  showFormInternal(
    formKey: FormKey,
    data?: JSONObject | undefined,
    formInternalOverride?: Form | undefined
  ): void {
    let formDefinition = Devvit.formDefinitions?.get(formKey);

    if (!formDefinition && this.#reconciler) {
      const hookForm = this.#reconciler.forms.get(formKey);

      if (hookForm) {
        formDefinition = {
          form: hookForm,
          onSubmit: () => {}, // no-op
        };
      }
    }

    if (!formDefinition) {
      throw new Error(
        'Form does not exist. Make sure you have added it using Devvit.createForm at the root of your app.'
      );
    }

    const formData =
      formInternalOverride ??
      (formDefinition.form instanceof Function
        ? formDefinition.form(data ?? {})
        : formDefinition.form);

    const form: FormProto = {
      fields: [],
      id: formKey,
      title: formData.title,
      acceptLabel: formData.acceptLabel,
      cancelLabel: formData.cancelLabel,
      shortDescription: formData.description,
    };

    assertValidFormFields(formData.fields);
    form.fields = transformFormFields(formData.fields);

    this.#effects.push({
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

    this.#effects.push({
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
    const inputUrl = typeof thingOrUrl === 'string' ? thingOrUrl : thingOrUrl.url;
    if (!URL.canParse(inputUrl)) {
      throw new TypeError(`Invalid URL: ${inputUrl}`);
    }
    const normalizedUrl = new URL(inputUrl).toString();
    this.#effects.push({
      type: EffectType.EFFECT_NAVIGATE_TO_URL,
      navigateToUrl: {
        url: normalizedUrl,
      },
    });
  }

  #postMessage: WebViewUIClient['postMessage'] = <T extends JSONValue>(
    webViewIdOrMessage: string | T,
    message?: T | undefined
  ): void => {
    const webViewId = message !== undefined ? (webViewIdOrMessage as string) : '';
    const msg = message !== undefined ? message : webViewIdOrMessage;
    this.#effects.push({
      type: EffectType.EFFECT_WEB_VIEW,
      webView: {
        postMessage: {
          webViewId,
          app: { message: msg },
        },
      },
    });
  };

  /** @internal */
  get __effects(): Effect[] {
    return this.#effects;
  }
}
