import { Devvit, FormOnSubmitEvent } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import { capitalize } from '../utils.js';

export const removeWordsFromDictionaryForm = Devvit.createForm(
  (data: { dictionaries?: string[]; selectedDictionary?: string }) => ({
    title: 'Remove words',
    description: 'Remove one to many words from a given dictionary',
    fields: [
      {
        type: 'select',
        name: 'dictionary',
        label: 'Dictionary',
        options: data.dictionaries!.map((dictionary) => ({
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
    acceptLabel: 'Remove',
    cancelLabel: 'Cancel',
  }),
  async (
    event: FormOnSubmitEvent<{
      dictionary?: string[];
      words?: string;
    }>,
    context
  ) => {
    const service = new Service(context);

    if (!event.values.words) {
      context.ui.showToast('Please enter a word');
      return;
    }
    const wordsToRemove = event.values.words.split(',').map((word) => capitalize(word.trim()));
    const wordsRemoved = await service.removeWordFromDictionary(
      event.values.dictionary?.[0]!,
      wordsToRemove
    );

    const removedWordsStr = wordsRemoved.removedWords.join(', ');
    const notFoundWordsStr = wordsRemoved.notFoundWords.join(', ');

    if (wordsRemoved.removedCount === 1 && wordsRemoved.notFoundWords.length === 0) {
      context.ui.showToast(`One word was removed: ${removedWordsStr}`);
    } else if (wordsRemoved.removedCount === 1 && wordsRemoved.notFoundWords.length === 1) {
      context.ui.showToast(`One word was removed: ${removedWordsStr}`);
      context.ui.showToast(`One word was not found: ${notFoundWordsStr}`);
    } else if (wordsRemoved.removedCount === 1 && wordsRemoved.notFoundWords.length > 1) {
      context.ui.showToast(`One word was removed: ${removedWordsStr}`);
      context.ui.showToast(
        `${wordsRemoved.notFoundWords.length} words were not found: ${notFoundWordsStr}`
      );
    } else if (wordsRemoved.removedCount > 1 && wordsRemoved.notFoundWords.length === 0) {
      context.ui.showToast(`${wordsRemoved.removedCount} words were removed: ${removedWordsStr}`);
    } else if (wordsRemoved.removedCount === 0 && wordsRemoved.notFoundWords.length === 1) {
      context.ui.showToast(`One word was not found: ${notFoundWordsStr}`);
    } else if (wordsRemoved.removedCount === 0 && wordsRemoved.notFoundWords.length > 1) {
      context.ui.showToast(
        `${wordsRemoved.notFoundWords.length} words were not found: ${notFoundWordsStr}`
      );
    } else if (wordsRemoved.removedCount > 0 && wordsRemoved.notFoundWords.length === 1) {
      context.ui.showToast(`${wordsRemoved.removedCount} words were removed: ${removedWordsStr}`);
      context.ui.showToast(`One word was not found: ${notFoundWordsStr}`);
    } else if (wordsRemoved.removedCount > 0 && wordsRemoved.notFoundWords.length > 1) {
      context.ui.showToast(`${wordsRemoved.removedCount} words were removed: ${removedWordsStr}`);
      context.ui.showToast(
        `${wordsRemoved.notFoundWords.length} words were not found: ${notFoundWordsStr}`
      );
    }
  }
);
