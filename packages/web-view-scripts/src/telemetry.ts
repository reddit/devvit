import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type {
  WebViewTelemetryLoadedEffect,
  WebViewTelemetryMetric,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/telemetry.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { emitTelemetryClickEffect } from '@devvit/shared-types/client/telemetry.js';
import { onFCP, onTTFB } from 'web-vitals';

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
    { capture: true, passive: true }
  );
}

function getNavigationTiming(): PerformanceNavigationTiming | undefined {
  return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
}

function buildTimeOriginMetric(spanName: string, offset: number): WebViewTelemetryMetric {
  return {
    spanName,
    timeStart: performance.timeOrigin,
    timeEnd: performance.timeOrigin + offset,
  };
}

function emitMetrics(metrics: WebViewTelemetryMetric[]): void {
  emitEffect({
    type: EffectType.EFFECT_TELEMETRY,
    telemetry: { metrics: { metrics } },
  });
}

/**
 * Measures the native startup window between the app launch (`startTime`) and the
 * moment the WebView began loading the page (`performance.timeOrigin`). This gap
 * covers WebView inflation, bridge setup, data fetching, and navigation triggers,
 * none of which is reflected in the in-page performance offsets.
 */
function measureWebViewInitialization(
  startTime: number | undefined
): WebViewTelemetryMetric | undefined {
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
function measureRenderDuration(
  firstContentfulPaintOffset: number | undefined
): WebViewTelemetryMetric | undefined {
  const navigationTiming = getNavigationTiming();
  const loadEventEndOffset = navigationTiming?.loadEventEnd;

  if (
    firstContentfulPaintOffset == null ||
    loadEventEndOffset == null ||
    loadEventEndOffset <= 0 ||
    !navigationTiming ||
    navigationTiming.responseStart <= 0
  ) {
    return undefined;
  }

  return {
    spanName: 'web_view_render_duration',
    timeStart: performance.timeOrigin + navigationTiming.responseStart,
    timeEnd: performance.timeOrigin + Math.max(firstContentfulPaintOffset, loadEventEndOffset),
  };
}

/**
 * Measures the DOM interactive milestone emitted under the historical TTI span name.
 */
function measureTti(): WebViewTelemetryMetric | undefined {
  const navTiming = getNavigationTiming();
  const ttiTime = navTiming?.domInteractive;

  if (!ttiTime) {
    return undefined;
  }

  return buildTimeOriginMetric('web_view_time_to_interactive', ttiTime);
}

function initPerformanceMonitoring(): void {
  const telemetryMetrics: WebViewTelemetryMetric[] = [];
  let firstContentfulPaintOffset: number | undefined;
  // FCP, TTFB, and load can complete the render-duration measurement.
  let renderDurationSent = false;

  const takeRenderDuration = (): WebViewTelemetryMetric | undefined => {
    if (renderDurationSent) return undefined;

    const renderDuration = measureRenderDuration(firstContentfulPaintOffset);
    if (!renderDuration) return undefined;

    renderDurationSent = true;
    return renderDuration;
  };

  const initialization = measureWebViewInitialization(globalThis.devvit?.startTime);
  if (initialization) telemetryMetrics.push(initialization);

  onFCP((metric) => {
    const firstContentfulPaintEntry = metric.entries[0];
    if (!firstContentfulPaintEntry) return;

    firstContentfulPaintOffset = firstContentfulPaintEntry.startTime;
    const fcp = buildTimeOriginMetric(
      'web_view_first_contentful_paint',
      firstContentfulPaintEntry.startTime
    );
    const renderDuration = takeRenderDuration();
    if (document.readyState === 'complete') {
      // load may already have emitted its batch, so late FCP emits standalone.
      emitMetrics(renderDuration ? [fcp, renderDuration] : [fcp]);
    } else {
      telemetryMetrics.push(fcp);
      if (renderDuration) telemetryMetrics.push(renderDuration);
    }
  });

  onTTFB((metric) => {
    const navigationEntry = metric.entries[0];
    if (!navigationEntry) return;

    const ttfb = buildTimeOriginMetric(
      'web_view_time_to_first_byte',
      navigationEntry.responseStart
    );
    const renderDuration = takeRenderDuration();
    emitMetrics(renderDuration ? [ttfb, renderDuration] : [ttfb]);
  });

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
    const renderDuration = takeRenderDuration();
    if (renderDuration) telemetryMetrics.push(renderDuration);
    telemetryMetrics.push(buildTimeOriginMetric('web_view_load', performance.now()));
    emitMetrics(telemetryMetrics);

    const navigationTiming = getNavigationTiming();
    if (
      !renderDuration &&
      firstContentfulPaintOffset != null &&
      navigationTiming?.responseStart &&
      !navigationTiming.loadEventEnd
    ) {
      // loadEventEnd is finalized only after all load handlers finish.
      globalThis.setTimeout(() => {
        const completedRenderDuration = takeRenderDuration();
        if (completedRenderDuration) emitMetrics([completedRenderDuration]);
      });
    }
  });
}
