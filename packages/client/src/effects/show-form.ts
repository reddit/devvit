import type { Form as FormProto } from '@devvit/protos';
import type { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';

import { emitEffect } from './emit-effect.js';
import { assertValidFormFields } from './helpers/assert-valid-form-fields.js';
import type { Form, FormToFormValues } from './helpers/form-types.js';
import type { FormEffectResponse } from './helpers/form-types.js';
import { getFormValues } from './helpers/get-form-values.js';
import { transformFormFields } from './helpers/transform-form.js';

let _formKey = 1;

const getNextFormKey = (): FormKey => {
  _formKey++;
  return `form.${_formKey}`;
};

/**
 * Opens a form in a modal.
 * Returns a promise that resolves with the form submission results.
 * The form can be submitted or canceled by the user.
 *
 * @param formDefinition - The form configuration
 * @returns A promise that resolves to either:
 *   - An object with `action: FormAction.SUBMITTED` and the submitted form values
 *   - An object with `action: FormAction.CANCELED` if the user canceled the form
 * @throws Will throw if the form fields are invalid
 */
export const showForm = async <const T extends Form>(
  formDefinition: T
): Promise<FormEffectResponse<FormToFormValues<T>>> => {
  const form: FormProto = {
    fields: [],
    id: getNextFormKey(),
    title: formDefinition.title,
    acceptLabel: formDefinition.acceptLabel,
    cancelLabel: formDefinition.cancelLabel,
    shortDescription: formDefinition.description,
  };

  assertValidFormFields(formDefinition.fields);
  form.fields = transformFormFields(formDefinition.fields);

  const response = await emitEffect({
    showForm: {
      form,
    },
    type: 3 satisfies EffectType.EFFECT_SHOW_FORM,
  });

  if (!response || !response.formSubmitted) {
    return {
      action: 'CANCELED',
    };
  }

  const formResults = getFormValues(response.formSubmitted.results);

  return {
    action: 'SUBMITTED',
    values: formResults as FormToFormValues<T>,
  };
};
