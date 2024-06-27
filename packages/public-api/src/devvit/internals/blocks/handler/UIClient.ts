import type { Toast as ToastProto } from '@devvit/protos';
import { EffectType, Form, ToastAppearance } from '@devvit/protos';
import type { JSONObject } from '@devvit/shared-types/json.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';
import type { Comment, Post, Subreddit, User } from '../../../../apis/reddit/models/index.js';
import { assertValidFormFields } from '../../../../apis/ui/helpers/assertValidFormFields.js';
import { transformFormFields } from '../../../../apis/ui/helpers/transformForm.js';
import type { Toast } from '../../../../types/toast.js';
import type { UIClient as _UIClient } from '../../../../types/ui-client.js';
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
  #renderContext: RenderContext;

  constructor(renderContext: RenderContext) {
    this.#renderContext = renderContext;
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

    const form = Form.fromPartial({
      id: formKey,
      title: formData.title,
      acceptLabel: formData.acceptLabel,
      cancelLabel: formData.cancelLabel,
      shortDescription: formData.description,
    });

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
      url = new URL(thingOrUrl.permalink, 'https://www.reddit.com').toString();
    }
    this.#renderContext.emitEffect(url, {
      type: EffectType.EFFECT_NAVIGATE_TO_URL,
      navigateToUrl: {
        url,
      },
    });
  }
}
