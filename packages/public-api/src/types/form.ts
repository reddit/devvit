import type {
  BaseField,
  BooleanField,
  Form,
  FormField,
  FormFieldGroup,
  FormValues as FormValuesTyped,
  ImageField,
  NumberField,
  ParagraphField,
  SelectField,
  SettingScopeType,
  StringField,
} from '@devvit/shared/types/form.js';
import { SettingScope } from '@devvit/shared/types/form.js';
import type { JSONObject } from '@devvit/shared-types/json.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';

import type { Devvit } from '../devvit/Devvit.js';
import type { FormToFormValues } from './index.js';

type UntypedFormValues = FormValuesTyped<JSONObject>;

export type {
  BaseField,
  BooleanField,
  Form,
  FormField,
  FormFieldGroup,
  FormKey,
  UntypedFormValues as FormValues,
  ImageField,
  NumberField,
  ParagraphField,
  SelectField,
  SettingScopeType,
  StringField,
};

export { SettingScope as SettingScope };

export type FormOnSubmitEvent<T extends Partial<JSONObject>> = {
  /** The form values that were submitted */
  values: T;
};

export type FormOnSubmitEventHandler<Data extends Partial<JSONObject>> = (
  /** The event object containing the results of the form submission */
  event: FormOnSubmitEvent<Data>,
  /** The current app context of the form submission event */
  context: Devvit.Context
) => void | Promise<void>;

/**
 * A function that returns a form. You can use this to dynamically generate a form.
 * @example
 * ```ts
 * const formKey = Devvit.createForm((data) => ({
 *   fields: data.fields,
 *   title: data.title,
 * }), callback);
 *
 * ...
 *
 * ui.showForm(formKey, {
 *  fields: [{ type: 'string', name: 'title', label: 'Title' }]
 *  title: 'My dynamic form'
 * });
 * ```
 * */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormFunction<T extends { [key: string]: any } = { [key: string]: any }> = (
  data: T
) => Form;

export type FormDefinition<T extends Form | FormFunction = Form | FormFunction> = {
  /** A form or a function that returns a form */
  form: T;
  /** A callback that will be invoked when the form is submitted */
  onSubmit: FormOnSubmitEventHandler<FormToFormValues<T>>;
};
