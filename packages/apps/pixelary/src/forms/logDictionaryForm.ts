import { Devvit } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const logDictionaryForm = Devvit.createForm(
  {
    fields: [
      {
        type: 'string',
        name: 'dictionary',
        label: 'Which dictionary do you want to log?',
        defaultValue: 'main',
      },
    ],
  },
  async (event, context) => {
    const service = new Service(context);
    await service.logDictionary(event.values.dictionary);
    context.ui.showToast('Dictionary retrieved. Run `devvit logs` to view');
  }
);
