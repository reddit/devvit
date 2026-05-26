import { type Effect, EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type { Form as FormProto } from '@devvit/protos/json/devvit/ui/form_builder/v1alpha/form.js';
import {
  type Toast as ToastProto,
  ToastAppearance,
} from '@devvit/protos/json/devvit/ui/toast/toast.js';
import type { Form } from '@devvit/shared';
import { resolveNavigationInput } from '@devvit/shared-types/thing-navigation.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';

import { Devvit } from '../../devvit/Devvit.js';
import type { JSONObject } from '../../types/json.js';
import type { Toast } from '../../types/toast.js';
import type { UIClient as _UIClient } from '../../types/ui-client.js';
import type { Comment, Post, Subreddit, User } from '../reddit/models/index.js';
import { assertValidFormFields } from './helpers/assertValidFormFields.js';
import { transformFormFields } from './helpers/transformForm.js';

export class UIClient implements _UIClient {
  readonly #effects: Effect[] = [];

  showForm(formKey: FormKey, data?: JSONObject | undefined): void {
    return this.showFormInternal(formKey, data);
  }

  showFormInternal(
    formKey: FormKey,
    data?: JSONObject | undefined,
    formInternalOverride?: Form | undefined
  ): void {
    const formDefinition = Devvit.formDefinitions?.get(formKey);

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
  navigateTo(thingOrUrl: string | { url: string; permalink?: string }): void {
    const inputUrl = resolveNavigationInput(thingOrUrl);
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

  /** @internal */
  get __effects(): Effect[] {
    return this.#effects;
  }
}
