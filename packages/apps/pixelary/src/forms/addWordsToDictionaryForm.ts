import { Devvit } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import { capitalizeWord } from '../utils/capitalizeWord.js';

export const addWordsToDictionaryForm = Devvit.createForm(
  {
    fields: [
      {
        type: 'string',
        name: 'dictionary',
        label: 'What dictionary do you want to add a word to?',
        defaultValue: 'main',
      },
      {
        type: 'string',
        name: 'words',
        label:
          'What words do you want to add to the dictionary? (Separate multiple words with commas)',
        required: true,
      },
    ],
  },
  async (event, context) => {
    const service = new Service(context);

    if (!event.values.words) {
      context.ui.showToast('Please enter a word');
      return;
    }
    const words = event.values.words.split(',').map((word) => capitalizeWord(word.trim()));
    const wordsAdded = await service.upsertDictionary(event.values.dictionary, words);

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
