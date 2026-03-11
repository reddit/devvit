import { initDevvitGlobal } from './devvit-global.js';
import { initFetch } from './fetch.js';
import { initScreenshotRequestListener } from './screenshot-listener.js';
import { initTelemetry } from './telemetry.js';
import { initToken } from './token.js';

initDevvitGlobal(document, location, window);
initTelemetry();
initFetch();
initToken();
initScreenshotRequestListener();
