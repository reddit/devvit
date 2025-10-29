import { initAnalytics } from './analytics.js';
import { initDevvitGlobal } from './devvit-global.js';
import { fetch } from './fetch.js';

initDevvitGlobal(document, location, window);
initAnalytics();

globalThis.fetch = fetch.bind(undefined, devvit.token, globalThis.fetch, location);
