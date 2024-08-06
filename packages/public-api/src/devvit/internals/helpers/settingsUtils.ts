import type { Metadata, ValidateFormRequest } from '@devvit/protos';
import { ValidateFormResponse } from '@devvit/protos';
import { makeAPIClients } from '../../../apis/makeAPIClients.js';
import { getFormValues } from '../../../apis/ui/helpers/getFormValues.js';
import type {
  OnValidateHandler,
  SettingsFormField,
  SettingsFormFieldGroup,
} from '../../../types/settings.js';
import { getContextFromMetadata } from '../context.js';

type SettingsPlainField = Exclude<SettingsFormField, SettingsFormFieldGroup>;

export function extractSettingsFields(settings: SettingsFormField[]): SettingsPlainField[] {
  return settings.flatMap((field) => {
    if (field.type === 'group') {
      return extractSettingsFields(field.fields);
    }
    return field;
  }) as SettingsPlainField[];
}

export async function onValidateFormHelper(
  req: ValidateFormRequest,
  settings: SettingsFormField[] | undefined,
  metadata: Metadata
): Promise<ValidateFormResponse> {
  if (!settings) {
    throw new Error('Settings were not defined.');
  }

  const response: ValidateFormResponse = {
    success: true,
    errors: {},
  };

  const formValues = getFormValues(req.fieldValues);
  const flattendFields = extractSettingsFields(settings);

  await Promise.all(
    flattendFields.map(async (field) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldName = (field as any).name as string | undefined;

      if (fieldName && field.onValidate) {
        const value = formValues[fieldName];
        const validator = field.onValidate as OnValidateHandler<unknown>;

        const context = Object.assign(
          makeAPIClients({
            metadata,
          }),
          getContextFromMetadata(metadata)
        );

        const error = await validator(
          {
            value,
            isEditing: req.editing,
          },
          context
        );

        if (error) {
          response.success = false;
          response.errors[fieldName] = error;
        }
      }
    })
  );

  return ValidateFormResponse.fromJSON(response);
}
