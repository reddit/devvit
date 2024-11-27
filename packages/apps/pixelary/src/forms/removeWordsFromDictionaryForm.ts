import { Devvit } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import { capitalizeWord } from '../utils/capitalizeWord.js';

export const removeWordsFromDictionaryForm = Devvit.createForm(
  {
    fields: [
      {
        type: 'string',
        name: 'dictionary',
        label: 'What dictionary do you want to remove a word from?',
        defaultValue: 'main',
      },
      {
        type: 'string',
        name: 'words',
        label:
          'What words do you want to remove from the dictionary? (Separate multiple words with commas)',
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
    const wordsToRemove = event.values.words.split(',').map((word) => capitalizeWord(word.trim()));
    const wordsRemoved = await service.removeWordFromDictionary(
      event.values.dictionary,
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
