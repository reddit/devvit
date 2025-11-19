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
    'click',
    (event: MouseEvent) => {
      const isStrict = isStrictClick(event);
      postWebViewInternalMessage({
        scope: WebViewInternalMessageScope.CLIENT,
        type: 'devvit-internal',
        analytics: { event: 'click', definition: isStrict ? 'strict' : 'default' },
      });
    },
    { passive: true }
  );
}

function postWebViewInternalMessage(internalMessage: WebViewInternalMessage): void {
  parent.postMessage(internalMessage, '*');
}

function isStrictClick(event: MouseEvent): boolean {
  if (!event.isTrusted) {
    return false;
  }

  const eventTarget = event.target as HTMLElement;

  const computedStyles = globalThis.window.getComputedStyle(eventTarget);
  if (computedStyles?.getPropertyValue('cursor') === 'pointer') {
    return true;
  }

  return elementOrParentIsInteractive(eventTarget);
}

function elementOrParentIsInteractive(element: HTMLElement): boolean {
  const STRICT_CLICK_TAGNAMES = ['A', 'BUTTON', 'CANVAS', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];

  let currentElement: HTMLElement | null = element;

  while (currentElement && currentElement.tagName !== 'BODY') {
    if (STRICT_CLICK_TAGNAMES.includes(currentElement.tagName)) {
      return true;
    }

    if (['true', 'plaintext-only'].includes(currentElement.getAttribute('contenteditable') ?? '')) {
      return true;
    }

    currentElement = currentElement.parentElement;
  }

  return false;
}
