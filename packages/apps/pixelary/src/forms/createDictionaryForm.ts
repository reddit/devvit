import { Devvit, FormOnSubmitEvent } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const createDictionaryForm = Devvit.createForm(
  {
    title: 'Create a dictionary',
    description:
      'Creates a new dictionary. If the dictionary already exists, no change will be made.',
    fields: [
      {
        type: 'string',
        name: 'dictionary',
        label: 'Dictionary',
        required: true,
      },
    ],
    acceptLabel: 'Create',
    cancelLabel: 'Cancel',
  },
  async (
    event: FormOnSubmitEvent<{
      dictionary?: string;
    }>,
    context
  ) => {
    const service = new Service(context);
    await service.registerDictionary(event.values.dictionary!);
    context.ui.showToast('Created dictionary');
  }
);
