import { Devvit, FormOnSubmitEvent } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const logDictionaryForm = Devvit.createForm(
  (data: { dictionaries?: string[] }) => ({
    title: 'Log dictionary',
    description: 'Which dictionary do you want to log?',
    fields: [
      {
        type: 'select',
        name: 'dictionary',
        label: 'Dictionary',
        options: data.dictionaries!.map((dictionary: string) => ({
          value: dictionary,
          label: dictionary,
        })),
        defaultValue: ['main'],
        required: true,
      },
    ],
    acceptLabel: 'Log',
    cancelLabel: 'Cancel',
  }),
  async (
    event: FormOnSubmitEvent<{
      dictionary?: string[];
    }>,
    context
  ) => {
    const service = new Service(context);
    const user = await context.reddit.getCurrentUser();
    if (!user) {
      return context.ui.showToast('User not found');
    }
    await service.logDictionary(event.values.dictionary?.[0]!, user.username);
    context.ui.showToast('Message sent');
  }
);
