import type {
  FieldConfig_Boolean,
  FieldConfig_Number,
  FieldConfig_Paragraph,
  FieldConfig_Selection,
  FieldConfig_Selection_Item,
  FieldConfig_String,
} from '@devvit/protos';
import type { JSONObject } from '@devvit/shared-types/json.js';
import type { Prettify } from '@devvit/shared-types/Prettify.js';

// FormValues is input for pre-populated form values
export type FormValues<T extends JSONObject> = T;

// FormRequest is equivalent to FormValues, but a semantically named alias for use in application code.
export type FormRequest<T extends JSONObject> = T;

export type Form = {
  /** The fields that will be displayed in the form */
  fields: readonly FormField[];
  /** An optional title for the form */
  title?: string;
  /** An optional description for the form */
  description?: string;
  /** An optional label for the submit button */
  acceptLabel?: string;
  /** An optional label for the cancel button */
  cancelLabel?: string;
};

export type BaseField<ValueType> = {
  /**
   * The name of the field. This will be used as the key in the `values` object
   * when the form is submitted.
   */
  name: string;
  /** The label of the field. This will be displayed to the user */
  label: string;
  /** An optional help text that will be displayed below the field */
  helpText?: string | undefined;
  /**
   * If true the field will be required and the user will not be able to submit
   * the form without filling it in.
   */
  required?: boolean | undefined;
  /** If true the field will be disabled */
  disabled?: boolean | undefined;
  /** The default value of the field */
  defaultValue?: ValueType | undefined;
  /**
   * This indicates whether the field (setting) is an app level or install level
   * setting. App setting values can be used by any installation.
   */
  scope?: SettingScopeType | undefined;
};

export type SettingScopeType = 'installation' | 'app';

export enum SettingScope {
  Installation = 'installation',
  App = 'app',
}

/** A text field */
export type StringField = Prettify<
  BaseField<string> &
    Omit<FieldConfig_String, 'minLength' | 'maxLength'> & {
      type: 'string';
      isSecret?: boolean;
    }
>;

// TODO remove @experimental once we've implemented the image field in the UI on all platforms
/**
 * Allows a user to upload an image as part of submitting the form. The string value that's
 * given back is the URL of the image.
 * @experimental
 */
export type ImageField = Omit<BaseField<string>, 'defaultValue'> & {
  type: 'image';
};

/** A paragraph or textarea field */
export type ParagraphField = Prettify<
  BaseField<string> &
    Omit<FieldConfig_Paragraph, 'maxCharacters'> & {
      type: 'paragraph';
    }
>;

/** A number field */
export type NumberField = Prettify<
  BaseField<number> &
    // TODO: allow "step" when <faceplate-text-input> start supporting it
    Omit<FieldConfig_Number, 'min' | 'max' | 'step'> & {
      type: 'number';
    }
>;

/** A boolean field displayed as a toggle */
export type BooleanField = Prettify<
  // Note: 'required' doesn't make sense for a boolean field
  Omit<BaseField<boolean>, 'required'> &
    FieldConfig_Boolean & {
      type: 'boolean';
    }
>;

/** A dropdown field that allows users to pick from a list of options */
export type SelectField = Prettify<
  BaseField<string[]> &
    Omit<FieldConfig_Selection, 'choices' | 'renderAsList' | 'minSelections' | 'maxSelections'> & {
      type: 'select';
      options: FieldConfig_Selection_Item[];
    }
>;

/** A grouping of fields */
export type FormFieldGroup = {
  type: 'group';
  /** The label of the group that will be displayed to the user */
  label: string;
  /** The fields that will be displayed in the group */
  fields: FormField[];
  /** An optional help text that will be displayed below the group */
  helpText?: string | undefined;
  required?: never;
};

export type FormField =
  | StringField
  | ImageField
  | ParagraphField
  | NumberField
  | BooleanField
  | SelectField
  | FormFieldGroup;
