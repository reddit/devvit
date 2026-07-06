import { WebViewInternalMessageScope } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js';
import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { webViewInternalMessageType } from '@devvit/shared-types/client/emit-effect.js';
import type { WebbitToken } from '@devvit/shared-types/webbit.js';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, it, type Mock, vi } from 'vitest';

import { initTelemetry } from './telemetry.js';

type EventListenerMock = Mock<(type: string, listener: (event: unknown) => void) => void>;
type TelemetryMetricForTest = { spanName: string };
type MetricsMessage = { telemetry?: { metrics?: { metrics?: TelemetryMetricForTest[] } } };

const addEventListenerMock: EventListenerMock = vi.fn();
const docAddEventListenerMock: EventListenerMock = vi.fn();
const postMessageMock: EventListenerMock = vi.fn();

const getMetricsPayloads = (): TelemetryMetricForTest[][] =>
  postMessageMock.mock.calls
    .map(([message]) => (message as MetricsMessage).telemetry?.metrics?.metrics)
    .filter((metrics): metrics is TelemetryMetricForTest[] => metrics != null);

const getFirstMetricsPayload = (): TelemetryMetricForTest[] => {
  const [metrics] = getMetricsPayloads();
  expect(metrics).toBeDefined();
  return metrics ?? [];
};

const expectMetricSpanNames = (metrics: TelemetryMetricForTest[], spanNames: string[]): void => {
  expect(metrics.map((metric) => metric.spanName)).toEqual(spanNames);
};

const createMockDevvit = (): DevvitGlobal => ({
  context: {} as DevvitGlobal['context'],
  dependencies: { client: undefined, webViewScripts: { hash: 'abc', version: '1.2.3' } },
  entrypoints: {},
  share: undefined,
  adPayload: undefined,
  appPermissionState: undefined,
  token: '' as WebbitToken,
  webViewMode: undefined,
  startTime: 1717171717171,
  refreshToken: undefined,
});

beforeEach(() => {
  globalThis.addEventListener = addEventListenerMock as unknown as typeof addEventListener;
  globalThis.document = {
    addEventListener: docAddEventListenerMock,
  } as unknown as Document;
  globalThis.parent = { postMessage: postMessageMock } as unknown as Window;
  // Dirty casting magic to avoid TS errors
  (globalThis as { window: Window }).window = {
    getComputedStyle: () => {},
  } as unknown as Window;
});

afterEach(() => {
  delete (globalThis as { document?: {} }).document;
  delete (globalThis as { parent?: {} }).parent;
  delete (globalThis as { addEventListener?: {} }).addEventListener;
  delete (globalThis as { window?: {} }).window;
});

const constructClickEvent = (overrides: Partial<MouseEvent>) => {
  return { isTrusted: true, ...overrides };
};
describe('telemetry', () => {
  const deadClick = { target: renderDom(`<div>div</div>`), isTrusted: true };

  beforeEach(() => {
    initTelemetry();
  });

  it('sends click telemetry on click', async () => {
    const onClick = getGlobalClickListener();
    onClick(deadClick);

    expect(postMessageMock).toHaveBeenCalledWith(...clickPostMessageWithDefinition('default'));
  });
  describe('strict click', () => {
    it('adds the strict flag if click target is an a, button, canvas, input, select, textarea, label element', () => {
      const onClick = getGlobalClickListener();
      const anchorElement = renderDom(`<a>Anchor</a>`);
      const buttonElement = renderDom(`<button>Button</button>`);
      const canvasElement = renderDom(`<canvas>Canvas</canvas>`);
      const inputElement = renderDom(`<input>Input</input>`);
      const selectElement = renderDom(`<select>Select</select>`);
      const textareaElement = renderDom(`<textarea>Textarea</textarea>`);
      const labelElement = renderDom(`<label>Label</label>`);

      [
        anchorElement,
        buttonElement,
        canvasElement,
        inputElement,
        selectElement,
        textareaElement,
        labelElement,
      ].forEach((element) => {
        onClick(constructClickEvent({ target: element }));
        expect(postMessageMock).toHaveBeenLastCalledWith(
          ...clickPostMessageWithDefinition('strict')
        );
      });
    });

    it('adds the strict flag if click target has contenteditable attribute', () => {
      const onClick = getGlobalClickListener();
      const contentEditableSpan = renderDom(
        '<span contenteditable="true">contenteditable span</span>'
      );
      contentEditableSpan.setAttribute('contenteditable', 'true');

      onClick(constructClickEvent({ target: contentEditableSpan }));
      expect(postMessageMock).toHaveBeenLastCalledWith(...clickPostMessageWithDefinition('strict'));

      const plainTextOnlyEditableSpan = renderDom(
        '<span contenteditable="true">contenteditable span</span>'
      );
      plainTextOnlyEditableSpan.setAttribute('contenteditable', 'plaintext-only');

      onClick(constructClickEvent({ target: plainTextOnlyEditableSpan }));
      expect(postMessageMock).toHaveBeenLastCalledWith(...clickPostMessageWithDefinition('strict'));
    });

    it('adds the strict flag if click target has cursor:pointer', () => {
      const onClick = getGlobalClickListener();
      const page = new JSDOM(
        `<style>div.clickable{cursor: pointer}</style><div class="clickable">div cursor pointer</div>`
      );
      const window = page.window as unknown as Window;
      (globalThis as { window: Window }).window = window;

      const divWithCursorPointer = window.document.querySelector('.clickable');

      onClick(constructClickEvent({ target: divWithCursorPointer }));
      expect(postMessageMock).toHaveBeenCalledWith(...clickPostMessageWithDefinition('strict'));
    });

    it('adds the strict flag if click target is a descendant of an a, button, canvas, input, select, textarea, label element', () => {
      const onClick = getGlobalClickListener();
      const buttonWithChildren = renderDom(`<button class="toplevel-btn">
          <img alt="snoo"/>
          <div class="useless-wrapper">
            <span class="target">Click Me!</span>
          </div>
        </button>`);
      const targetSpan = buttonWithChildren.querySelector('.target');

      onClick(constructClickEvent({ target: targetSpan }));
      expect(postMessageMock).toHaveBeenCalledWith(...clickPostMessageWithDefinition('strict'));
    });

    it('adds the strict flag if click target is a descendant of a contenteditable element', () => {
      const onClick = getGlobalClickListener();
      const buttonWithChildren = renderDom(`<div contenteditable="true">
          <img alt="snoo"/>
          <div class="useless-wrapper">
            <span class="target">Click Me!</span>
          </div>
        </div>`);
      const targetSpan = buttonWithChildren.querySelector('.target');

      onClick(constructClickEvent({ target: targetSpan }));
      expect(postMessageMock).toHaveBeenCalledWith(...clickPostMessageWithDefinition('strict'));
    });

    it('does not add the strict flag if event is not trusted (emited programmatically)', () => {
      const onClick = getGlobalClickListener();
      const button = renderDom('<button>I am just a button</button>');

      onClick(constructClickEvent({ target: button, isTrusted: false }));
      expect(postMessageMock).toHaveBeenCalledWith(...clickPostMessageWithDefinition('default'));
    });
  });

  describe('elemTrackId', () => {
    it('uses data-track-id from the clicked element', () => {
      const onClick = getGlobalClickListener();
      const el = renderDom('<div data-track-id="cta-buy">Buy</div>');

      onClick(constructClickEvent({ target: el }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', 'cta-buy')
      );
    });

    it('uses id when data-track-id is absent', () => {
      const onClick = getGlobalClickListener();
      const el = renderDom('<div id="hero-banner">Banner</div>');

      onClick(constructClickEvent({ target: el }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', 'hero-banner')
      );
    });

    it('prefers data-track-id over id on the same element', () => {
      const onClick = getGlobalClickListener();
      const el = renderDom('<div id="fallback" data-track-id="preferred">Text</div>');

      onClick(constructClickEvent({ target: el }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', 'preferred')
      );
    });

    it('traverses up to find data-track-id on an ancestor', () => {
      const onClick = getGlobalClickListener();
      const wrapper = renderDom('<div data-track-id="card"><span class="child">Click</span></div>');
      const target = wrapper.querySelector('.child');

      onClick(constructClickEvent({ target }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', 'card')
      );
    });

    it('traverses up to find id on an ancestor', () => {
      const onClick = getGlobalClickListener();
      const wrapper = renderDom('<div id="sidebar"><span>Click</span></div>');
      const target = wrapper.querySelector('span');

      onClick(constructClickEvent({ target }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', 'sidebar')
      );
    });

    it('handles svg element targets', () => {
      const onClick = getGlobalClickListener();
      const page = new JSDOM('<svg data-track-id="icon"><circle /></svg>');
      const target = page.window.document.querySelector('circle');

      onClick(constructClickEvent({ target }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', 'icon')
      );
    });

    it('uses the parent element for text node targets', () => {
      const onClick = getGlobalClickListener();
      const wrapper = renderDom('<div id="copy"><span>Click</span></div>');
      const target = wrapper.querySelector('span')?.firstChild ?? null;

      onClick(constructClickEvent({ target }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', 'copy')
      );
    });

    it('picks closest ancestor data-track-id over farther ancestor id', () => {
      const onClick = getGlobalClickListener();
      const wrapper = renderDom(
        '<div id="outer"><div data-track-id="inner"><span>Click</span></div></div>'
      );
      const target = wrapper.querySelector('span');

      onClick(constructClickEvent({ target }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', 'inner')
      );
    });

    it('treats empty data-track-id as unset', () => {
      const onClick = getGlobalClickListener();
      const wrapper = renderDom(
        '<div id="outer"><div data-track-id=""><span>Click</span></div></div>'
      );
      const target = wrapper.querySelector('span');

      onClick(constructClickEvent({ target }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', 'outer')
      );
    });

    it('is undefined when no data-track-id or id exists in the tree', () => {
      const onClick = getGlobalClickListener();
      const el = renderDom('<div><span>Click</span></div>');
      const target = el.querySelector('span');

      onClick(constructClickEvent({ target }));
      expect(postMessageMock).toHaveBeenLastCalledWith(
        ...clickPostMessageWithDefinition('default', undefined)
      );
    });
  });
});

it('sends load telemetry on window load', async () => {
  initTelemetry();

  const loadHandlers = addEventListenerMock.mock.calls
    .filter((call) => call[0] === 'load')
    .map((call) => call[1]);
  loadHandlers.forEach((handler) => handler?.({}));

  expect(postMessageMock).toHaveBeenCalledWith(
    {
      scope: WebViewInternalMessageScope.CLIENT,
      type: webViewInternalMessageType,
      analytics: {
        event: 'web-view-loaded',
        timeStart: expect.any(Number),
        timeEnd: expect.any(Number),
        duration: expect.any(Number),
      },
      realtimeEffect: undefined,
      telemetry: {
        event: 'web-view-loaded',
        loaded: {
          event: 'web-view-loaded',
          timeStart: expect.any(Number),
          timeEnd: expect.any(Number),
          duration: expect.any(Number),
        },
      },
    },
    '*'
  );
});

describe('performance monitoring', () => {
  // Capture callbacks by entry type since multiple observers are created
  const observerCallbacks: Record<string, (list: PerformanceObserverEntryList) => void> = {};

  const triggerNavigationObserver = (entry: Partial<PerformanceNavigationTiming> = {}) => {
    const entries = [
      {
        entryType: 'navigation',
        requestStart: 100,
        responseStart: 200,
        domInteractive: 300,
        loadEventEnd: 400,
        ...entry,
      } as PerformanceNavigationTiming,
    ];

    observerCallbacks['navigation']?.({
      getEntries: () => entries,
      getEntriesByName: () => [],
      getEntriesByType: () => entries,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(observerCallbacks).forEach((key) => delete observerCallbacks[key]);

    globalThis.devvit = createMockDevvit();

    // Add window.addEventListener mock for performance monitoring
    (globalThis as { window: Window }).window = {
      getComputedStyle: () => {},
      addEventListener: addEventListenerMock,
    } as unknown as Window;

    // Mock PerformanceObserver on globalThis - capture callbacks by entry type
    (globalThis as unknown as { PerformanceObserver: unknown }).PerformanceObserver =
      class MockPerformanceObserver {
        #callback: (list: PerformanceObserverEntryList) => void;

        constructor(callback: (list: PerformanceObserverEntryList) => void) {
          this.#callback = callback;
        }
        observe(options: PerformanceObserverInit) {
          // Store callback by entry type for later triggering
          options.entryTypes?.forEach((type) => {
            observerCallbacks[type] = this.#callback;
          });
          if (options.type) {
            observerCallbacks[options.type] = this.#callback;
          }
        }
        disconnect() {}
        static supportedEntryTypes = ['paint', 'longtask', 'navigation'];
      };

    // Default mock for performance.getEntriesByType - needed because measureTti runs during init
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    initTelemetry();
  });

  it('captures ttfb metric', async () => {
    // Stub performance.getEntriesByType for navigation timing
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    // Trigger ALL load handlers (initLoadedEvent and initPerformanceMonitoring both register load handlers)
    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_time_to_first_byte',
                timeStart: 1717171717171 + 100,
                timeEnd: 1717171717171 + 200,
              },
            ]),
          },
        },
      }),
      '*'
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_initialization',
      'web_view_time_to_interactive',
      'web_view_time_to_first_byte',
      'web_view_load',
    ]);
  });

  it('captures fcp metric', async () => {
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;

    // Stub performance.getEntriesByType for paint AND navigation entries
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') {
        return [paintEntry];
      }
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    // Trigger the paint PerformanceObserver callback with mock FCP entry
    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    // Trigger ALL load handlers to emit metrics
    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_first_contentful_paint',
                timeStart: performance.timeOrigin,
                timeEnd: performance.timeOrigin + 300,
              },
            ]),
          },
        },
      }),
      '*'
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_initialization',
      'web_view_time_to_interactive',
      'web_view_first_contentful_paint',
      'web_view_render_duration',
      'web_view_time_to_first_byte',
      'web_view_load',
    ]);
  });

  it('sends fcp as a standalone metric when fcp fires after load', async () => {
    const loadEventEnd = 400;
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;
    let paintEntries: PerformanceEntry[] = [];
    vi.spyOn(performance, 'now').mockReturnValue(450);

    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return paintEntries;
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    // Simulate load firing before FCP arrives
    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    // After load, readyState becomes 'complete'
    (globalThis.document as unknown as { readyState: string }).readyState = 'complete';
    triggerNavigationObserver({ loadEventEnd });

    postMessageMock.mockClear();

    // FCP observer fires late, after load
    paintEntries = [paintEntry];
    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_first_contentful_paint',
                timeStart: performance.timeOrigin,
                timeEnd: performance.timeOrigin + 300,
              },
              {
                spanName: 'web_view_render_duration',
                timeStart: performance.timeOrigin + 200,
                timeEnd: performance.timeOrigin + loadEventEnd,
              },
            ]),
          },
        },
      }),
      '*'
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_first_contentful_paint',
      'web_view_render_duration',
    ]);
  });

  it('captures tti metric', async () => {
    // Mock getEntriesByType for navigation
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    // Trigger ALL load handlers to emit metrics (TTI is captured during init since document.readyState !== 'loading')
    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    // TTI timeEnd = timeStart + domInteractive (domInteractive = 300)
    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_time_to_interactive',
                timeStart: performance.timeOrigin,
                timeEnd: performance.timeOrigin + 300,
              },
            ]),
          },
        },
      }),
      '*'
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_initialization',
      'web_view_time_to_interactive',
      'web_view_time_to_first_byte',
      'web_view_load',
    ]);
  });

  it('captures the web_view_initialization gap metric', async () => {
    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_initialization',
                timeStart: 1717171717171,
                timeEnd: performance.timeOrigin,
              },
            ]),
          },
        },
      }),
      '*'
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_initialization',
      'web_view_time_to_interactive',
      'web_view_time_to_first_byte',
      'web_view_load',
    ]);
  });

  it('captures load metric with timeOrigin-aligned timestamps', async () => {
    const performanceNow = 400;
    vi.spyOn(performance, 'now').mockReturnValue(performanceNow);

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_load',
                timeStart: performance.timeOrigin,
                timeEnd: performance.timeOrigin + performanceNow,
              },
            ]),
          },
        },
      }),
      '*'
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_initialization',
      'web_view_time_to_interactive',
      'web_view_time_to_first_byte',
      'web_view_load',
    ]);
  });

  it('emits timeOrigin metrics without startTime', async () => {
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;
    const performanceNow = 400;
    vi.clearAllMocks();
    Object.keys(observerCallbacks).forEach((key) => delete observerCallbacks[key]);
    globalThis.devvit = { ...createMockDevvit(), startTime: undefined };
    vi.spyOn(performance, 'now').mockReturnValue(performanceNow);

    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return [paintEntry];
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    initTelemetry();

    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: [
              {
                spanName: 'web_view_time_to_interactive',
                timeStart: performance.timeOrigin,
                timeEnd: performance.timeOrigin + 300,
              },
              {
                spanName: 'web_view_first_contentful_paint',
                timeStart: performance.timeOrigin,
                timeEnd: performance.timeOrigin + paintEntry.startTime,
              },
              {
                spanName: 'web_view_render_duration',
                timeStart: performance.timeOrigin + 200,
                timeEnd: performance.timeOrigin + 400,
              },
              {
                spanName: 'web_view_load',
                timeStart: performance.timeOrigin,
                timeEnd: performance.timeOrigin + performanceNow,
              },
            ],
          },
        },
      }),
      '*'
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_time_to_interactive',
      'web_view_first_contentful_paint',
      'web_view_render_duration',
      'web_view_load',
    ]);
  });

  it('captures render duration from the navigation observer when fcp fires before load', async () => {
    const performanceNow = 450;
    let loadEventEnd = 0;
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;
    const paintEntries: PerformanceEntry[] = [paintEntry];
    vi.spyOn(performance, 'now').mockReturnValue(performanceNow);
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return paintEntries;
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    const loadMetricsMessage = postMessageMock.mock.calls
      .map(([message]) => message as MetricsMessage)
      .find((message) => message.telemetry?.metrics);
    expect(loadMetricsMessage?.telemetry?.metrics?.metrics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ spanName: 'web_view_render_duration' })])
    );

    loadEventEnd = 400;
    postMessageMock.mockClear();
    triggerNavigationObserver({ loadEventEnd });

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_render_duration',
                timeStart: performance.timeOrigin + 200,
                timeEnd: performance.timeOrigin + loadEventEnd,
              },
            ]),
          },
        },
      }),
      '*'
    );
  });

  it('captures render duration when buffered fcp arrives after navigation observer', async () => {
    const performanceNow = 450;
    const loadEventEnd = 400;
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;
    let paintEntries: PerformanceEntry[] = [];
    vi.spyOn(performance, 'now').mockReturnValue(performanceNow);
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return paintEntries;
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    postMessageMock.mockClear();
    triggerNavigationObserver({ loadEventEnd });

    expect(postMessageMock).not.toHaveBeenCalled();

    (globalThis.document as unknown as { readyState: string }).readyState = 'complete';

    paintEntries = [paintEntry];
    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_render_duration',
                timeStart: performance.timeOrigin + 200,
                timeEnd: performance.timeOrigin + loadEventEnd,
              },
            ]),
          },
        },
      }),
      '*'
    );
  });

  it('captures render duration in the late fcp batch when load fires before fcp', async () => {
    const performanceNow = 450;
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 500,
    } as PerformancePaintTiming;
    let paintEntries: PerformanceEntry[] = [];
    vi.spyOn(performance, 'now').mockReturnValue(performanceNow);
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return paintEntries;
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    const loadMetricsMessage = postMessageMock.mock.calls
      .map(([message]) => message as MetricsMessage)
      .find((message) => message.telemetry?.metrics);
    expect(loadMetricsMessage?.telemetry?.metrics?.metrics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ spanName: 'web_view_render_duration' })])
    );

    (globalThis.document as unknown as { readyState: string }).readyState = 'complete';
    triggerNavigationObserver();
    postMessageMock.mockClear();

    paintEntries = [paintEntry];
    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: WebViewInternalMessageScope.CLIENT,
        type: webViewInternalMessageType,
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_render_duration',
                timeStart: performance.timeOrigin + 200,
                timeEnd: performance.timeOrigin + paintEntry.startTime,
              },
            ]),
          },
        },
      }),
      '*'
    );
  });

  it('does not capture render duration when loadEventEnd is unavailable', async () => {
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;
    vi.spyOn(performance, 'now').mockReturnValue(400);
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return [paintEntry];
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd: 0,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));
    triggerNavigationObserver({ loadEventEnd: 0 });

    const metricsMessages = postMessageMock.mock.calls
      .map(([message]) => message as MetricsMessage)
      .filter((message) => message.telemetry?.metrics);
    expect(metricsMessages[0]?.telemetry?.metrics?.metrics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ spanName: 'web_view_render_duration' })])
    );
  });

  it('uses fcp as the render duration end when fcp is slower than load', async () => {
    const performanceNow = 400;
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 600,
    } as PerformancePaintTiming;
    vi.spyOn(performance, 'now').mockReturnValue(performanceNow);
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return [paintEntry];
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));
    triggerNavigationObserver();

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_render_duration',
                timeStart: performance.timeOrigin + 200,
                timeEnd: performance.timeOrigin + paintEntry.startTime,
              },
            ]),
          },
        },
      }),
      '*'
    );
  });

  it('does not capture render duration without fcp', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(400);

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));
    triggerNavigationObserver();

    const metricsMessages = postMessageMock.mock.calls
      .map(([message]) => message as MetricsMessage)
      .filter((message) => message.telemetry?.metrics);
    expect(metricsMessages).toHaveLength(1);
    expect(metricsMessages[0]?.telemetry?.metrics?.metrics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ spanName: 'web_view_render_duration' })])
    );
  });

  it('does not capture render duration without navigation timing', async () => {
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;
    vi.spyOn(performance, 'now').mockReturnValue(400);
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return [paintEntry];
      return [];
    });

    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    const metricsMessages = postMessageMock.mock.calls
      .map(([message]) => message as MetricsMessage)
      .filter((message) => message.telemetry?.metrics);
    expect(metricsMessages[0]?.telemetry?.metrics?.metrics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ spanName: 'web_view_render_duration' })])
    );
  });

  it('does not capture render duration when responseStart is invalid', async () => {
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;
    vi.spyOn(performance, 'now').mockReturnValue(400);
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return [paintEntry];
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 0,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));
    triggerNavigationObserver({ responseStart: 0 });

    const metricsMessages = postMessageMock.mock.calls
      .map(([message]) => message as MetricsMessage)
      .filter((message) => message.telemetry?.metrics);
    expect(metricsMessages[0]?.telemetry?.metrics?.metrics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ spanName: 'web_view_render_duration' })])
    );
  });

  it('sends late fcp without render duration when responseStart is invalid', async () => {
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;
    vi.spyOn(performance, 'now').mockReturnValue(400);
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return [paintEntry];
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 0,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));
    triggerNavigationObserver({ responseStart: 0 });

    (globalThis.document as unknown as { readyState: string }).readyState = 'complete';
    postMessageMock.mockClear();

    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        telemetry: {
          metrics: {
            metrics: expect.arrayContaining([
              {
                spanName: 'web_view_first_contentful_paint',
                timeStart: performance.timeOrigin,
                timeEnd: performance.timeOrigin + paintEntry.startTime,
              },
            ]),
          },
        },
      }),
      '*'
    );

    const metricsMessages = postMessageMock.mock.calls
      .map(([message]) => message as MetricsMessage)
      .filter((message) => message.telemetry?.metrics);
    expect(metricsMessages[0]?.telemetry?.metrics?.metrics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ spanName: 'web_view_render_duration' })])
    );
  });

  it('does not emit duplicate render duration metrics from duplicate fcp callbacks', async () => {
    const performanceNow = 400;
    const paintEntry = {
      name: 'first-contentful-paint',
      startTime: 300,
    } as PerformancePaintTiming;
    vi.spyOn(performance, 'now').mockReturnValue(performanceNow);
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) => {
      if (type === 'paint') return [paintEntry];
      if (type === 'navigation') {
        return [
          {
            requestStart: 100,
            responseStart: 200,
            domInteractive: 300,
            loadEventEnd: 400,
          } as PerformanceNavigationTiming,
        ];
      }
      return [];
    });

    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    const loadHandlers = addEventListenerMock.mock.calls
      .filter((call) => call[0] === 'load')
      .map((call) => call[1]);
    loadHandlers.forEach((handler) => handler?.({}));

    (globalThis.document as unknown as { readyState: string }).readyState = 'complete';
    triggerNavigationObserver();
    observerCallbacks['paint']?.({
      getEntries: () => [paintEntry],
    } as PerformanceObserverEntryList);

    const renderDurationMetrics = postMessageMock.mock.calls
      .flatMap(([message]) => (message as MetricsMessage).telemetry?.metrics?.metrics ?? [])
      .filter((metric) => metric.spanName === 'web_view_render_duration');
    expect(renderDurationMetrics).toHaveLength(1);
  });
});

const renderDom = (htmlFragment: string): HTMLElement => {
  const doc = new JSDOM(`<div class="wrapper">${htmlFragment}</div>`).window.document;
  return doc.querySelector('.wrapper')!.childNodes[0]! as HTMLElement;
};

const getGlobalClickListener = () => {
  return docAddEventListenerMock.mock.calls.find((call) => call[0] === 'click')?.[1]!;
};

const clickPostMessageWithDefinition = (
  definition: string,
  elemTrackId?: string
): [unknown, string] => {
  return [
    {
      scope: WebViewInternalMessageScope.CLIENT,
      type: webViewInternalMessageType,
      analytics: { event: 'click', definition, elemTrackId },
      realtimeEffect: undefined,
      telemetry: { event: 'click', click: { event: 'click', definition, elemTrackId } },
    },
    '*',
  ];
};
