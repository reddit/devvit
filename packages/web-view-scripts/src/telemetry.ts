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

// Render duration still needs an emit guard because both FCP and navigation callbacks can attempt it.
let renderDurationSent: boolean = false;

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

function getNavigationTiming(): PerformanceNavigationTiming | undefined {
  return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
}

function measureTtfb(): WebViewTelemetryMetric | undefined {
  const navigationTiming = getNavigationTiming();

  if (!startTime || !navigationTiming) {
    return undefined;
  }

  return {
    spanName: 'web_view_time_to_first_byte',
    timeStart: startTime + navigationTiming.requestStart,
    timeEnd: startTime + navigationTiming.responseStart,
  };
}

/**
 * Builds both the legacy v1 metric and the clock-aligned v2 metric for a span.
 *
 * The v1 metric keeps its historical (flawed) anchoring of the native `startTime`
 * clock against a `performance.timeOrigin`-relative offset, preserving the existing
 * series. The v2 metric anchors `timeStart` to `performance.timeOrigin`, the same
 * clock the offset is measured from, so its absolute timestamps are correct while
 * the duration stays identical to v1.
 */
function buildMetricPair(spanName: string, offset: number): WebViewTelemetryMetric[] {
  if (!startTime) {
    return [];
  }

  return [
    {
      spanName,
      timeStart: startTime,
      timeEnd: startTime + offset,
    },
    {
      spanName: `${spanName}_v2`,
      timeStart: performance.timeOrigin,
      timeEnd: performance.timeOrigin + offset,
    },
  ];
}

/**
 * Measures the native startup window between the app launch (`startTime`) and the
 * moment the WebView began loading the page (`performance.timeOrigin`). This gap
 * covers WebView inflation, bridge setup, data fetching, and navigation triggers,
 * none of which is reflected in the in-page performance offsets.
 */
function measureWebViewInitialization(): WebViewTelemetryMetric | undefined {
  if (!startTime) {
    return undefined;
  }

  return {
    spanName: 'web_view_initialization',
    timeStart: startTime,
    timeEnd: performance.timeOrigin,
  };
}

// Match the existing app-readiness signal by ending at the slower of first paint and page load.
function maybeMeasureRenderDuration(): WebViewTelemetryMetric | undefined {
  const navigationTiming = getNavigationTiming();
  const fcpOffset = performance
    .getEntriesByType('paint')
    .find((entry) => entry.name === 'first-contentful-paint')?.startTime;
  const loadEventEndOffset = measureLoadEventEnd(navigationTiming);

  if (
    fcpOffset == null ||
    loadEventEndOffset == null ||
    !navigationTiming ||
    navigationTiming.responseStart <= 0
  ) {
    return undefined;
  }

  return {
    spanName: 'web_view_render_duration',
    timeStart: performance.timeOrigin + navigationTiming.responseStart,
    timeEnd: performance.timeOrigin + Math.max(fcpOffset, loadEventEndOffset),
  };
}

function measureFcp(): WebViewTelemetryMetric[] {
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

  if (!fcpEntry || !startTime) {
    return [];
  }

  return buildMetricPair('web_view_first_contentful_paint', fcpEntry.startTime);
}

function measureLoad(): WebViewTelemetryMetric[] {
  if (!startTime) {
    return [];
  }

  return buildMetricPair('web_view_load', performance.now());
}

function measureLoadEventEnd(
  navigationTiming: PerformanceNavigationTiming | undefined = getNavigationTiming()
): number | undefined {
  return navigationTiming && navigationTiming.loadEventEnd > 0
    ? navigationTiming.loadEventEnd
    : undefined;
}

function emitRenderDuration(): void {
  if (renderDurationSent) {
    return;
  }

  const renderDuration = maybeMeasureRenderDuration();
  if (!renderDuration) {
    return;
  }

  renderDurationSent = true;
  emitEffect({
    type: EffectType.EFFECT_TELEMETRY,
    telemetry: { metrics: { metrics: [renderDuration] } },
  });
}

/**
 * Measure Time to Interactive (TTI)
 * Uses a heuristic: measured after a quiet window period following page load.
 * This represents when the page is fully interactive and stable.
 * Avoids long task API which isn't supported on iOS.
 */
function measureTti(): WebViewTelemetryMetric[] {
  const navTiming = getNavigationTiming() as PerformanceNavigationTiming;
  const ttiTime = navTiming.domInteractive;

  if (!startTime || !ttiTime) {
    return [];
  }

  return buildMetricPair('web_view_time_to_interactive', ttiTime);
}

function initPerformanceMonitoring(): void {
  telemetryMetrics = [];
  startTime = globalThis.devvit?.startTime;
  renderDurationSent = false;
  if (!startTime) {
    return;
  }

  const initialization = measureWebViewInitialization();
  if (initialization) telemetryMetrics.push(initialization);

  // Measure TTFB immediately if ready, otherwise handled in load event
  if (document.readyState === 'complete') {
    const ttfb = measureTtfb();
    if (ttfb) telemetryMetrics.push(ttfb);
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        const fcp = measureFcp();
        observer.disconnect();
        if (fcp.length === 0) break;
        const renderDuration = renderDurationSent ? undefined : maybeMeasureRenderDuration();
        if (renderDuration) renderDurationSent = true;
        if (document.readyState === 'complete') {
          // load may already have emitted its batch, so late FCP emits standalone.
          emitEffect({
            type: EffectType.EFFECT_TELEMETRY,
            telemetry: { metrics: { metrics: renderDuration ? [...fcp, renderDuration] : fcp } },
          });
        } else {
          telemetryMetrics.push(...fcp);
          if (renderDuration) telemetryMetrics.push(renderDuration);
        }
        break;
      }
    }
  });

  observer.observe({ type: 'paint', buffered: true });

  const navigationObserver = new PerformanceObserver((list) => {
    const navigationEntry = list.getEntries().find((entry) => entry.entryType === 'navigation');
    if (navigationEntry) {
      navigationObserver.disconnect();
      emitRenderDuration();
    }
  });

  navigationObserver.observe({ type: 'navigation', buffered: true });

  if (document.readyState === 'loading') {
    globalThis.addEventListener('DOMContentLoaded', () => {
      telemetryMetrics.push(...measureTti());
    });
  } else {
    telemetryMetrics.push(...measureTti());
  }

  // Emit metrics after page is fully loaded
  globalThis.addEventListener('load', () => {
    const ttfb = measureTtfb();
    if (ttfb) telemetryMetrics.push(ttfb);

    telemetryMetrics.push(...measureLoad());

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
