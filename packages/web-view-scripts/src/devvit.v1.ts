import { queryCurrentScriptSrc } from './client.js';
import { initDevvitGlobal } from './devvit-global.js';
import { initFetch } from './fetch.js';
import { initScreenshotRequestListener } from './screenshot-listener.js';
import { initTelemetry } from './telemetry.js';
import { initToken } from './token.js';
import { initWebViewMode } from './web-view-mode.js';

initDevvitGlobal(document, location, window);
initTelemetry();
initFetch();
initScreenshotRequestListener(queryCurrentScriptSrc(document) ?? '');
initToken();
initWebViewMode();
