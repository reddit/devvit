import { queryCurrentScriptSrc } from './client.js';
import { initDevvitGlobal } from './devvit-global.js';
import { initErrorListener } from './error-listener.js';
import { initFetch } from './fetch.js';
import { initScreenshotRequestListener } from './screenshot-listener.js';
import { initTelemetry } from './telemetry.js';
import { initToken } from './token.js';
import { initWebViewMode } from './web-view-mode.js';

const scriptSrc = queryCurrentScriptSrc(document) ?? '';

initErrorListener(scriptSrc);
initDevvitGlobal(document, location, window);
initTelemetry();
initFetch();
initScreenshotRequestListener(scriptSrc);
initToken();
initWebViewMode();
