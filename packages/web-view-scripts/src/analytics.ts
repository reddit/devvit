import {
  type WebViewInternalMessage,
  WebViewInternalMessageScope,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js';

/**
 * initAnalytics is added to all Devvit apps which use web views.
 *
 * This sends interaction events to the parent window via postMessage.
 * These metrics are used to inform app performance and feed ranking.
 */
export function initAnalytics(): void {
  addEventListener('load', () => {
    const timeStart = performance.timeOrigin;
    const duration = performance.now();
    const timeEnd = performance.timeOrigin + duration;

    // to-do: support devvit.debug.
    // if (devvit.debug.analytics) console.debug(`[analytics] loaded in ${duration} ms`);
    postWebViewInternalMessage({
      scope: WebViewInternalMessageScope.CLIENT,
      type: 'devvit-internal',
      analytics: { event: 'web-view-loaded', timeStart, timeEnd, duration },
    });
  });

  document.addEventListener(
    'pointerdown',
    () => {
      postWebViewInternalMessage({
        scope: WebViewInternalMessageScope.CLIENT,
        type: 'devvit-internal',
        analytics: { event: 'click' },
      });
    },
    { passive: true }
  );
}

function postWebViewInternalMessage(internalMessage: WebViewInternalMessage): void {
  parent.postMessage(internalMessage, '*');
}
