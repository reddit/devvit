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

/*
[
    { label: 'main', value: 'main' },
    { label: 'r/piercing', value: 'r/piercing' }, //hardcoding for r/piercing dictionary takeover 9/26/24
    { label: 'r/NintendoSwitch', value: 'r/NintendoSwitch' }, //hardcoding for r/NintendoSwitch dictionary takeover 10/10/24
    { label: 'Halloween', value: 'Halloween' },
    { label: 'Thanksgiving', value: 'Thanksgiving' },
]
*/
