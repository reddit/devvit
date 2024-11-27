// import { updatePostPreview } from './actions/updatePostPreview.js';
/*
 * Jobs
 */
import './jobs/firstSolveComment.js';
import './jobs/newDrawingPinnedComment.js';
import './jobs/postExpiration.js';
import './jobs/userLeveledUp.js';

import { Devvit } from '@devvit/public-api';

/*
 * Menu Actions
 */
import { addWordsToDictionary } from './actions/addWordsToDictionary.js';
import { createTopWeeklyDrawingPost } from './actions/createTopWeeklyDrawingsPost.js';
import { expirePost } from './actions/expirePost.js';
import { installGame } from './actions/installGame.js';
import { logDictionary } from './actions/logDictionary.js';
import { logSelectedDictionaryName } from './actions/logSelectedDictionaryName.js';
import { migrateDrawingPost } from './actions/migrateDrawingPost.js';
import { migratePinnedPost } from './actions/migratePinnedPost.js';
import { newPinnedPost } from './actions/newPinnedPost.js';
import { removeWordsFromDictionary } from './actions/removeWordsFromDictionary.js';
import { revealWord } from './actions/revealWord.js';
import { saveDictionaryToRedis } from './actions/saveDictionaryToRedis.js';
import { selectDictionary } from './actions/selectDictionary.js';
import { stopScoreboardJobs } from './actions/stopScoreboardJobs.js';
import { addWordsToDictionaryForm } from './forms/addWordsToDictionaryForm.js';
/*
 * Forms
 */
import { logDictionaryForm } from './forms/logDictionaryForm.js';
import { removeWordsFromDictionaryForm } from './forms/removeWordsFromDictionaryForm.js';
import { selectDictionaryForm } from './forms/selectDictionaryForm.js';
import { Router } from './posts/Router.js';
/*
 * Triggers
 */
import { appUpgrade } from './triggers/appUpgrade.js';
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
Devvit.addMenuItem(installGame); // Mod
Devvit.addMenuItem(stopScoreboardJobs); // Admin
Devvit.addMenuItem(createTopWeeklyDrawingPost); // Mod
Devvit.addMenuItem(saveDictionaryToRedis); // Admin
Devvit.addMenuItem(addWordsToDictionary(addWordsToDictionaryForm)); // Mod
Devvit.addMenuItem(logDictionary(logDictionaryForm)); // Mod
Devvit.addMenuItem(selectDictionary(selectDictionaryForm)); // Mod
Devvit.addMenuItem(removeWordsFromDictionary(removeWordsFromDictionaryForm));
Devvit.addMenuItem(newPinnedPost);

// Posts
// Devvit.addMenuItem(updatePostPreview);
Devvit.addMenuItem(migrateDrawingPost); // Admin
Devvit.addMenuItem(migratePinnedPost); // Admin
Devvit.addMenuItem(logSelectedDictionaryName); // Mod
Devvit.addMenuItem(revealWord);
Devvit.addMenuItem(expirePost); // Mod

/*
 * Triggers
 */

Devvit.addTrigger(appUpgrade);
Devvit.addTrigger(commentDelete);

export default Devvit;
