import { FormField as FormFieldProto, FormFieldType } from '@devvit/protos';
import type {
  BooleanField,
  FormField,
  FormFieldGroup,
  ImageField,
  NumberField,
  ParagraphField,
  SelectField,
  StringField,
} from '../../../types/form.js';

export function transformFormFields(fields: readonly FormField[]): FormFieldProto[] {
  return fields.map((field) => {
    switch (field.type) {
      case 'string':
        return transformStringField(field);
      case 'image':
        return transformImageField(field);
      case 'paragraph':
        return transformParagraphField(field);
      case 'number':
        return transformNumberField(field);
      case 'select':
        return transformSelectField(field);
      case 'boolean':
        return transformBooleanField(field);
      case 'group':
        return transformGroupField(field);
      default:
        throw new Error('Unknown field type.');
    }
  });
}

function transformStringField(field: StringField): FormFieldProto {
  return FormFieldProto.fromPartial({
    defaultValue: {
      fieldType: FormFieldType.STRING,
      stringValue: field.defaultValue,
    },
    disabled: field.disabled,
    fieldConfig: {
      stringConfig: {
        placeholder: field.placeholder,
      },
    },
    fieldId: field.name,
    fieldType: FormFieldType.STRING,
    helpText: field.helpText,
    label: field.label,
    required: field.required,
    isSecret: field.isSecret,
  });
}

function transformImageField(field: ImageField): FormFieldProto {
  return FormFieldProto.fromPartial({
    disabled: field.disabled,
    fieldId: field.name,
    fieldType: FormFieldType.IMAGE,
    helpText: field.helpText,
    label: field.label,
    required: field.required,
  });
}

function transformParagraphField(field: ParagraphField): FormFieldProto {
  return FormFieldProto.fromPartial({
    defaultValue: {
      fieldType: FormFieldType.PARAGRAPH,
      stringValue: field.defaultValue,
    },
    disabled: field.disabled,
    fieldConfig: {
      paragraphConfig: {
        lineHeight: field.lineHeight,
        placeholder: field.placeholder,
      },
    },
    fieldId: field.name,
    fieldType: FormFieldType.PARAGRAPH,
    helpText: field.helpText,
    label: field.label,
    required: field.required,
  });
}

function transformNumberField(field: NumberField): FormFieldProto {
  return FormFieldProto.fromPartial({
    defaultValue: {
      fieldType: FormFieldType.NUMBER,
      numberValue: field.defaultValue,
    },
    disabled: field.disabled,
    fieldConfig: {
      numberConfig: {},
    },
    fieldId: field.name,
    fieldType: FormFieldType.NUMBER,
    helpText: field.helpText,
    label: field.label,
    required: field.required,
  });
}

function transformSelectField(field: SelectField): FormFieldProto {
  return FormFieldProto.fromPartial({
    defaultValue: {
      fieldType: FormFieldType.SELECTION,
      selectionValue: {
        values: field.defaultValue,
      },
    },
    disabled: field.disabled,
    fieldConfig: {
      selectionConfig: {
        choices: field.options,
        multiSelect: field.multiSelect,
      },
    },
    fieldId: field.name,
    fieldType: FormFieldType.SELECTION,
    helpText: field.helpText,
    label: field.label,
    required: field.required,
  });
}

function transformBooleanField(field: BooleanField): FormFieldProto {
  return FormFieldProto.fromPartial({
    defaultValue: {
      fieldType: FormFieldType.BOOLEAN,
      boolValue: field.defaultValue,
    },
    disabled: field.disabled,
    fieldId: field.name,
    fieldType: FormFieldType.BOOLEAN,
    helpText: field.helpText,
    label: field.label,
  });
}

function transformGroupField(field: FormFieldGroup): FormFieldProto {
  return FormFieldProto.fromPartial({
    fieldType: FormFieldType.GROUP,
    fieldConfig: {
      groupConfig: {
        fields: transformFormFields(field.fields),
      },
    },
    label: field.label,
    helpText: field.helpText,
  });
}
