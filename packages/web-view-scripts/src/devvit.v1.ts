import { initAnalytics } from './analytics.js';
import { initDevvitGlobal } from './devvit-global.js';
import { initFetch } from './fetch.js';

initDevvitGlobal(document, location, window);
initAnalytics();
initFetch();
