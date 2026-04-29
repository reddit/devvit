import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type {
  WebViewTelemetryLoadedEffect,
  WebViewTelemetryMetric,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/telemetry.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { emitTelemetryClickEffect } from '@devvit/shared-types/client/telemetry.js';

let telemetryMetrics: WebViewTelemetryMetric[];

/** startTime (UTC milliseconds) is provided by the client within the bridge context, to be used for all metrics */
let startTime: number | undefined;

/**
 * `initTelemetry()` is added to all Devvit apps which use web views.
 *
 * This sends interaction events to the parent window via postMessage.
 * These metrics are used to inform app performance and feed ranking.
 */
export function initTelemetry(): void {
  initPerformanceMonitoring();
  initLoadedEvent();
  initClickEvent();
}

function initLoadedEvent(): void {
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

    void emitEffect({
      type: EffectType.EFFECT_TELEMETRY,
      telemetry: { event: loaded.event, loaded },
      // to-do: remove once all clients support `telemetry`. Deprecated on
      //        2025-11-24.
      analytics: loaded,
    });
  });
}

function initClickEvent(): void {
  document.addEventListener(
    'click',
    (event) => {
      emitTelemetryClickEffect(event);
    },
    { passive: true }
  );
}

function measureTtfb(): WebViewTelemetryMetric | undefined {
  const navigationTiming = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (!startTime || !navigationTiming) {
    return undefined;
  }

  return {
    spanName: 'web_view_time_to_first_byte',
    timeStart: startTime + navigationTiming.requestStart,
    timeEnd: startTime + navigationTiming.responseStart,
  };
}

function measureFcp(): WebViewTelemetryMetric | undefined {
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

  if (!fcpEntry || !startTime) {
    return;
  }

  return {
    spanName: 'web_view_first_contentful_paint',
    timeStart: startTime,
    timeEnd: startTime + fcpEntry.startTime,
  };
}

function measureLoad(): WebViewTelemetryMetric | undefined {
  if (!startTime) {
    return;
  }

  return {
    spanName: 'web_view_load',
    timeStart: startTime,
    timeEnd: startTime + performance.now(),
  };
}

/**
 * Measure Time to Interactive (TTI)
 * Uses a heuristic: measured after a quiet window period following page load.
 * This represents when the page is fully interactive and stable.
 * Avoids long task API which isn't supported on iOS.
 */
function measureTti(): WebViewTelemetryMetric | undefined {
  const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const ttiTime = navTiming.domInteractive;

  if (!startTime || !ttiTime) {
    return undefined;
  }

  return {
    spanName: 'web_view_time_to_interactive',
    timeStart: startTime,
    timeEnd: startTime + ttiTime,
  };
}

function initPerformanceMonitoring(): void {
  telemetryMetrics = [];
  startTime = globalThis.devvit?.startTime;
  if (!startTime) {
    return;
  }

  // Measure TTFB immediately if ready, otherwise handled in load event
  if (document.readyState === 'complete') {
    const ttfb = measureTtfb();
    if (ttfb) telemetryMetrics.push(ttfb);
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        const fcp = measureFcp();
        if (fcp) telemetryMetrics.push(fcp);
        observer.disconnect();
      }
    }
  });

  observer.observe({ entryTypes: ['paint'] });

  if (document.readyState === 'loading') {
    globalThis.addEventListener('DOMContentLoaded', () => {
      const tti = measureTti();
      if (tti) telemetryMetrics.push(tti);
    });
  } else {
    const tti = measureTti();
    if (tti) telemetryMetrics.push(tti);
  }

  // Emit metrics after page is fully loaded
  globalThis.addEventListener('load', () => {
    const ttfb = measureTtfb();
    if (ttfb) telemetryMetrics.push(ttfb);

    const load = measureLoad();
    if (load) telemetryMetrics.push(load);

    emitEffect({
      type: EffectType.EFFECT_TELEMETRY,
      telemetry: {
        metrics: {
          metrics: telemetryMetrics,
        },
      },
    });
  });
}
