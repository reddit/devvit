import { Devvit, FormOnSubmitEvent } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import { capitalize } from '../utils.js';

export const addWordsToDictionaryForm = Devvit.createForm(
  (data: { dictionaries?: string[]; selectedDictionary?: string }) => ({
    title: 'Add words to dictionary',
    description: 'Add one to many words to a given dictionary',
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
    acceptLabel: 'Add',
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
    const words = event.values.words.split(',').map((word: string) => capitalize(word.trim()));
    const wordsAdded = await service.upsertDictionary(event.values.dictionary?.[0]!, words);

    const addedWordsStr = wordsAdded.uniqueNewWords.join(', ');
    const notAddedWordsStr = wordsAdded.duplicatesNotAdded.join(', ');

    if (wordsAdded.uniqueNewWords.length === 1 && wordsAdded.duplicatesNotAdded.length === 0) {
      context.ui.showToast(`One word was added: ${addedWordsStr}`);
    } else if (
      wordsAdded.uniqueNewWords.length === 1 &&
      wordsAdded.duplicatesNotAdded.length === 1
    ) {
      context.ui.showToast(`One word was added: ${addedWordsStr}`);
      context.ui.showToast(`One word was already in the collection: ${notAddedWordsStr}`);
    } else if (wordsAdded.uniqueNewWords.length === 1 && wordsAdded.duplicatesNotAdded.length > 1) {
      context.ui.showToast(`One word was added: ${addedWordsStr}`);
      context.ui.showToast(
        `${wordsAdded.duplicatesNotAdded.length} words were already in the collection: ${notAddedWordsStr}`
      );
    } else if (wordsAdded.uniqueNewWords.length > 1 && wordsAdded.duplicatesNotAdded.length === 0) {
      context.ui.showToast(
        `${wordsAdded.uniqueNewWords.length} words were added: ${addedWordsStr}`
      );
    } else if (
      wordsAdded.uniqueNewWords.length === 0 &&
      wordsAdded.duplicatesNotAdded.length === 1
    ) {
      context.ui.showToast(`One word was already in the collection: ${notAddedWordsStr}`);
    } else if (wordsAdded.uniqueNewWords.length === 0 && wordsAdded.duplicatesNotAdded.length > 1) {
      context.ui.showToast(
        `${wordsAdded.duplicatesNotAdded.length} words were already in the collection: ${notAddedWordsStr}`
      );
    } else if (wordsAdded.uniqueNewWords.length > 0 && wordsAdded.duplicatesNotAdded.length === 1) {
      context.ui.showToast(
        `${wordsAdded.uniqueNewWords.length} words were added: ${addedWordsStr}`
      );
      context.ui.showToast(`One word was already in the collection: ${notAddedWordsStr}`);
    } else if (wordsAdded.uniqueNewWords.length > 0 && wordsAdded.duplicatesNotAdded.length > 1) {
      context.ui.showToast(
        `${wordsAdded.uniqueNewWords.length} words were added: ${addedWordsStr}`
      );
      context.ui.showToast(
        `${wordsAdded.duplicatesNotAdded.length} words were already in the collection: ${notAddedWordsStr}`
      );
    }
  }
);
