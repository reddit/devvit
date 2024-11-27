import { Devvit } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const selectDictionaryForm = Devvit.createForm(
  (data) => {
    //TODO: get dictionary names from redis (need to implement this in Service)
    return {
      fields: [
        {
          name: 'dictionary',
          label: 'Which dictionary do you want to use?',
          type: 'select',
          options: [
            { label: 'main', value: 'main' },
            { label: 'r/piercing', value: 'r/piercing' }, //hardcoding for r/piercing dictionary takeover 9/26/24
            { label: 'r/NintendoSwitch', value: 'r/NintendoSwitch' }, //hardcoding for r/NintendoSwitch dictionary takeover 10/10/24
            { label: 'Halloween', value: 'Halloween' },
            { label: 'Thanksgiving', value: 'Thanksgiving' },
          ],
          defaultValue: ['main'],
        },
      ],
      title: 'Select a dictionary',
      acceptLabel: 'Select',
    };
  },
  async (event, context) => {
    if (!Array.isArray(event.values.dictionary)) {
      return context.ui.showToast('Please select a dictionary');
    }
    const value = event.values.dictionary[0];
    if (typeof value !== 'string') {
      return context.ui.showToast('Selected value must be a string!');
    }

    const service = new Service(context);
    await service.selectDictionary(value);

    return context.ui.showToast(`Dictionary selected: ${event.values.dictionary[0]}`);
  }
);
