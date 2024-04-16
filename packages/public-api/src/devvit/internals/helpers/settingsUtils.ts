import type { Metadata, ValidateFormRequest } from '@devvit/protos';
import { ValidateFormResponse } from '@devvit/protos';
import { makeAPIClients } from '../../../apis/makeAPIClients.js';
import { getFormValues } from '../../../apis/ui/helpers/getFormValues.js';
import type { OnValidateHandler, SettingsFormField } from '../../../types/settings.js';
import { getContextFromMetadata } from '../context.js';

export async function onValidateFormHelper(
  req: ValidateFormRequest,
  settings: SettingsFormField[] | undefined,
  metadata: Metadata
): Promise<ValidateFormResponse> {
  if (!settings) {
    throw new Error('Settings were not defined.');
  }

  const response = ValidateFormResponse.fromPartial({
    success: true,
    errors: {},
  });

  const formValues = getFormValues(req.fieldValues);

  const flattendFields = settings.flatMap((field) => {
    if (field.type === 'group') {
      return field.fields;
    }
    return field;
  }) as SettingsFormField[];

  await Promise.all(
    flattendFields.map(async (field) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldName = (field as any).name as string | undefined;

      if (fieldName && field.type !== 'group' && field.onValidate) {
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

  return response;
}
