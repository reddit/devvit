/*
 * Jobs
 */

import './jobs/firstSolveComment.js';
import './jobs/newDrawingPinnedComment.js';
import './jobs/userLeveledUp.js';

import { Devvit } from '@devvit/public-api';

/*
 * Menu Actions
 */
import { addWordsToDictionary } from './actions/addWordsToDictionary.js';
//import { stopScoreboardJobs } from './actions/stopScoreboardJobs.js';
import { createDictionary } from './actions/createDictionary.js';
import { createTopWeeklyDrawingPost } from './actions/createTopWeeklyDrawingsPost.js';
import { installGame } from './actions/installGame.js';
import { logDictionary } from './actions/logDictionary.js';
import { logSelectedDictionaryName } from './actions/logSelectedDictionaryName.js';
import { migrateDrawingPost } from './actions/migrateDrawingPost.js';
import { migratePinnedPost } from './actions/migratePinnedPost.js';
import { newPinnedPost } from './actions/newPinnedPost.js';
import { removeWordsFromDictionary } from './actions/removeWordsFromDictionary.js';
import { replaceDictionary } from './actions/replaceDictionary.js';
import { revealWord } from './actions/revealWord.js';
//import { saveDictionaryToRedis } from './actions/saveDictionaryToRedis.js';
import { selectDictionary } from './actions/selectDictionary.js';
import { updateDrawingPostPreview } from './actions/updateDrawingPostPreview.js';
import { addWordsToDictionaryForm } from './forms/addWordsToDictionaryForm.js';
import { createDictionaryForm } from './forms/createDictionaryForm.js';
/*
 * Forms
 */
import { logDictionaryForm } from './forms/logDictionaryForm.js';
import { removeWordsFromDictionaryForm } from './forms/removeWordsFromDictionaryForm.js';
import { replaceDictionaryForm } from './forms/replaceDictionaryForm.js';
import { selectDictionaryForm } from './forms/selectDictionaryForm.js';
import { Router } from './posts/Router.js';
/*
 * Triggers
 */
import { appUpgrade } from './triggers/appUpgrade.js';
import { commentCreate } from './triggers/commentCreate.js';
import { commentDelete } from './triggers/commentDelete.js';

/*
 * Plugins
 */

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

/*
 * Custom Post
 */

Devvit.addCustomPostType({
  name: 'Pixelary',
  description: 'Draw, Guess, Laugh!',
  height: 'tall',
  render: Router,
});

/*
 * Menu Actions
 */

// Subreddit
Devvit.addMenuItem(installGame);
//Devvit.addMenuItem(stopScoreboardJobs);
Devvit.addMenuItem(createTopWeeklyDrawingPost);
//Devvit.addMenuItem(saveDictionaryToRedis);
Devvit.addMenuItem(addWordsToDictionary(addWordsToDictionaryForm));
Devvit.addMenuItem(logDictionary(logDictionaryForm));
Devvit.addMenuItem(selectDictionary(selectDictionaryForm));
Devvit.addMenuItem(removeWordsFromDictionary(removeWordsFromDictionaryForm));
Devvit.addMenuItem(newPinnedPost);
Devvit.addMenuItem(createDictionary(createDictionaryForm));
Devvit.addMenuItem(replaceDictionary(replaceDictionaryForm));

// Posts
Devvit.addMenuItem(updateDrawingPostPreview);
Devvit.addMenuItem(migrateDrawingPost);
Devvit.addMenuItem(migratePinnedPost);
Devvit.addMenuItem(logSelectedDictionaryName);
Devvit.addMenuItem(revealWord);

/*
 * Triggers
 */

Devvit.addTrigger(appUpgrade);
Devvit.addTrigger(commentDelete);
Devvit.addTrigger(commentCreate);

export default Devvit;
