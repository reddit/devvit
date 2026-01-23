import { initAnalytics } from './analytics.js';
import { initDevvitGlobal } from './devvit-global.js';
import { initFetch } from './fetch.js';
import { initToken } from './token.js';

initDevvitGlobal(document, location, window);
initAnalytics();
initFetch();
initToken();
