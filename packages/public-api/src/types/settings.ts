import type { Prettify } from '@devvit/shared-types/Prettify.js';

export type { SettingsClient, SettingsValues } from '@devvit/settings';

import type { Devvit } from '../devvit/Devvit.js';
import type {
  BooleanField,
  FormFieldGroup,
  NumberField,
  ParagraphField,
  SelectField,
  StringField,
} from './form.js';

export type SettingsFormFieldValidatorEvent<ValueType> = {
  value: ValueType | undefined;
  isEditing: boolean;
};

export type OnValidateHandler<ValueType> = (
  event: SettingsFormFieldValidatorEvent<ValueType>,
  context: Devvit.Context
) => void | string | Promise<void | string>;

export type ValidatedFormField<Field, ValueType> = Omit<Field, 'required'> & {
  onValidate?: OnValidateHandler<ValueType>;
};

export type ValidatedStringField = Prettify<ValidatedFormField<StringField, string>>;
export type ValidatedParagraphField = Prettify<ValidatedFormField<ParagraphField, string>>;
export type ValidatedNumberField = Prettify<ValidatedFormField<NumberField, number>>;
export type ValidatedBooleanField = Prettify<ValidatedFormField<BooleanField, boolean>>;
export type ValidatedSelectField = Prettify<ValidatedFormField<SelectField, string[]>>;

export type SettingsFormFieldGroup = Prettify<
  Omit<FormFieldGroup, 'fields'> & {
    fields: SettingsFormField[];
  }
>;

export type SettingsFormField =
  | ValidatedStringField
  | ValidatedParagraphField
  | ValidatedNumberField
  | ValidatedBooleanField
  | ValidatedSelectField
  | SettingsFormFieldGroup;
