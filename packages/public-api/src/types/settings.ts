import type {
  BooleanField,
  FormFieldGroup,
  NumberField,
  ParagraphField,
  SelectField,
  StringField,
} from './form.js';
import type { Prettify } from '@devvit/shared-types/Prettify.js';
import type { Devvit } from '../devvit/Devvit.js';

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

export type SettingsValues = { [key: string]: string | string[] | boolean | number | undefined };

/**
 * The Settings API Client lets you retrieve the settings values for your app set by the installer.
 * Use this in conjunction with `Devvit.addSettings`.
 */
export type SettingsClient = {
  /**
   * Get a single setting value by name.
   * @param name The name of the setting to retrieve.
   * @returns A promise that resolves to the setting value, or undefined if the setting doesn't exist.
   */
  get<T = string | string[] | boolean | number>(name: string): Promise<T | undefined>;
  /**
   * Get all settings values.
   * @returns A promise that resolves to an object containing all settings values.
   */
  getAll<T extends object = SettingsValues>(): Promise<T>;
};
