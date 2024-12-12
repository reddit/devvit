import { Devvit, FormOnSubmitEvent } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import { capitalize } from '../utils.js';

export const replaceDictionaryForm = Devvit.createForm(
  (data: { dictionaries?: string[]; selectedDictionary?: string }) => ({
    title: 'Replace dictionary',
    description: 'Perform a wholesale replacement of a given dictionary',
    fields: [
      {
        type: 'select',
        name: 'dictionary',
        label: 'Dictionary',
        options: data.dictionaries!.map((dictionary: string) => ({
          value: dictionary,
          label: dictionary,
        })),
        defaultValue: [data.selectedDictionary ?? 'main'],
        required: true,
      },
      {
        type: 'paragraph',
        name: 'words',
        label: 'Words',
        required: true,
        helpText: 'Separate by commas',
      },
    ],
    acceptLabel: 'Replace',
    cancelLabel: 'Cancel',
  }),
  async (
    event: FormOnSubmitEvent<{
      dictionary?: string;
      words?: string;
    }>,
    context
  ) => {
    const service = new Service(context);

    if (!event.values.words) {
      context.ui.showToast('Please enter a word');
      return;
    }

    const dictionaryName = event.values.dictionary?.[0]!;
    const words = event.values.words.split(',').map((word: string) => capitalize(word.trim()));

    const isValid = words.every((word) => /^[a-zA-Z ]+$/.test(word));
    if (!isValid) {
      context.ui.showToast('Invalid characters found');
      return;
    }

    await service.saveDictionary(dictionaryName, words);
    context.ui.showToast('Replaced dictionary');
  }
);
