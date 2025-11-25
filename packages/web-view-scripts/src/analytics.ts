import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type {
  WebViewTelemetryClickEffect,
  WebViewTelemetryLoadedEffect,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/telemetry.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

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
    const loaded: WebViewTelemetryLoadedEffect = {
      event: 'web-view-loaded',
      timeStart,
      timeEnd,
      duration,
    };

    // to-do: support devvit.debug.
    // if (devvit.debug.analytics) console.debug(`[analytics] loaded in ${duration} ms`);
    void emitEffect({
      type: EffectType.EFFECT_TELEMETRY,
      telemetry: { event: 'web-view-loaded', loaded },
      // to-do: remove once all clients support `telemetry`. Deprecated on
      //        2025-11-24.
      analytics: loaded,
    });
  });

  document.addEventListener(
    'click',
    (event) => {
      const click: WebViewTelemetryClickEffect = {
        event: 'click',
        definition: isStrictClick(event) ? 'strict' : 'default',
      };
      void emitEffect({
        type: EffectType.EFFECT_TELEMETRY,
        telemetry: { event: 'click', click },
        // to-do: remove once all clients support `telemetry`. Deprecated on
        //        2025-11-24.
        analytics: click,
      });
    },
    { passive: true }
  );
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
