import { Devvit, FormOnSubmitEvent } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const selectDictionaryForm = Devvit.createForm(
  (data: { dictionaries?: string[]; selectedDictionary?: string }) => {
    return {
      title: 'Select a dictionary',
      description: 'Which dictionary do you want to use?',
      fields: [
        {
          name: 'dictionary',
          label: 'Dictionary',
          type: 'select',
          options: data.dictionaries!.map((dictionary) => ({
            value: dictionary,
            label: dictionary,
          })),
          defaultValue: [data.selectedDictionary ?? 'main'],
          required: true,
        },
      ],
      acceptLabel: 'Select',
      cancelLabel: 'Cancel',
    };
  },
  async (
    event: FormOnSubmitEvent<{
      dictionary?: string[];
    }>,
    context
  ) => {
    const value = event.values.dictionary?.[0]!;
    const service = new Service(context);
    await service.selectDictionary(value);
    return context.ui.showToast('Selected dictionary');
  }
);
