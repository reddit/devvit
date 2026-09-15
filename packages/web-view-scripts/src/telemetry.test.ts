import { WebViewInternalMessageScope } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js';
import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { webViewInternalMessageType } from '@devvit/shared-types/client/emit-effect.js';
import type { WebbitToken } from '@devvit/shared-types/webbit.js';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, it, type Mock, vi } from 'vitest';
import type { FCPMetric, TTFBMetric } from 'web-vitals';

import { initTelemetry } from './telemetry.js';

const webVitalsMocks = vi.hoisted(() => ({
  onFCP: vi.fn(),
  onTTFB: vi.fn(),
}));

vi.mock('web-vitals', () => webVitalsMocks);
vi.mock('web-vitals/onFCP.js', () => ({ onFCP: webVitalsMocks.onFCP }));
vi.mock('web-vitals/onTTFB.js', () => ({ onTTFB: webVitalsMocks.onTTFB }));

type EventListenerMock = Mock<
  (
    type: string,
    listener: (event: unknown) => void,
    options?: boolean | AddEventListenerOptions
  ) => void
>;
type TelemetryMetricForTest = {
  spanName: string;
  timeStart?: number;
  timeEnd?: number;
};
type MetricsMessage = { telemetry?: { metrics?: { metrics?: TelemetryMetricForTest[] } } };

const addEventListenerMock: EventListenerMock = vi.fn();
const docAddEventListenerMock: EventListenerMock = vi.fn();
const postMessageMock: EventListenerMock = vi.fn();
const trustedEvent: MessageEvent = { isTrusted: true } as MessageEvent;
let reportFcp: ((metric: FCPMetric) => void) | undefined;
let reportTtfb: ((metric: TTFBMetric) => void) | undefined;

const triggerFcp = (
  entry?: PerformancePaintTiming,
  value: number = entry?.startTime ?? 0
): void => {
  reportFcp?.({ value, entries: entry ? [entry] : [] } as FCPMetric);
};

const triggerTtfb = (
  entry?: PerformanceNavigationTiming,
  value: number = entry?.responseStart ?? 0
): void => {
  reportTtfb?.({ value, entries: entry ? [entry] : [] } as TTFBMetric);
};

const getMetricsPayloads = (): TelemetryMetricForTest[][] =>
  postMessageMock.mock.calls
    .map(([message]) => (message as MetricsMessage).telemetry?.metrics?.metrics)
    .filter((metrics): metrics is TelemetryMetricForTest[] => metrics != null);

const getFirstMetricsPayload = (): TelemetryMetricForTest[] => {
  const [metrics] = getMetricsPayloads();
  expect(metrics).toBeDefined();
  return metrics ?? [];
};

const getAllMetrics = (): TelemetryMetricForTest[] => getMetricsPayloads().flat();

const expectMetric = (spanName: string, timeStart: number, timeEnd: number): void => {
  expect(getAllMetrics()).toContainEqual({ spanName, timeStart, timeEnd });
};

const expectNoMetric = (spanName: string): void => {
  expect(getAllMetrics()).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ spanName })])
  );
};

const triggerWindowEvent = (type: string): void => {
  addEventListenerMock.mock.calls
    .filter(([eventType]) => eventType === type)
    .forEach(([, handler]) => handler?.(trustedEvent));
};

const expectMetricSpanNames = (metrics: TelemetryMetricForTest[], spanNames: string[]): void => {
  expect(metrics.map((metric) => metric.spanName)).toEqual(spanNames);
};

const createMockDevvit = (): DevvitGlobal => ({
  context: {} as DevvitGlobal['context'],
  dependencies: { client: undefined, webViewScripts: { hash: 'abc', version: '1.2.3' } },
  entrypoints: {},
  experiments: { devvit_require_trusted_events: 'enabled' },
  share: undefined,
  adPayload: undefined,
  appPermissionState: undefined,
  token: '' as WebbitToken,
  webViewMode: undefined,
  startTime: 1717171717171,
  refreshToken: undefined,
});

beforeEach(() => {
  globalThis.devvit = createMockDevvit();
  webVitalsMocks.onFCP.mockImplementation((callback) => {
    reportFcp = callback;
  });
  webVitalsMocks.onTTFB.mockImplementation((callback) => {
    reportTtfb = callback;
  });
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

afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve));
  reportFcp = undefined;
  reportTtfb = undefined;
  delete (globalThis as { devvit?: DevvitGlobal }).devvit;
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

  it('listens for clicks in the capture phase', () => {
    expect(docAddEventListenerMock).toHaveBeenCalledWith('click', expect.any(Function), {
      capture: true,
      passive: true,
    });
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

    it('ignores untrusted clicks', () => {
      globalThis.devvit.experiments = { devvit_require_trusted_events: 'enabled' };
      const onClick = getGlobalClickListener();
      const button = renderDom('<button>I am just a button</button>');

      onClick(constructClickEvent({ target: button, isTrusted: false }));
      expect(postMessageMock).not.toHaveBeenCalled();
    });

    it.each([undefined, 'control_1'])(
      'sends untrusted clicks when the experiment variant is %s',
      (variant) => {
        globalThis.devvit.experiments =
          variant == null ? {} : { devvit_require_trusted_events: variant };
        const onClick = getGlobalClickListener();
        const button = renderDom('<button>I am just a button</button>');

        onClick(constructClickEvent({ target: button, isTrusted: false }));
        expect(postMessageMock).toHaveBeenCalledWith(...clickPostMessageWithDefinition('default'));
      }
    );
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

  triggerWindowEvent('load');

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

it('ignores untrusted window load events', () => {
  globalThis.devvit.experiments = { devvit_require_trusted_events: 'enabled' };
  initTelemetry();

  const loadHandlers = addEventListenerMock.mock.calls
    .filter((call) => call[0] === 'load')
    .map((call) => call[1]);
  loadHandlers.forEach((handler) => handler?.({ isTrusted: false }));

  expect(postMessageMock).not.toHaveBeenCalled();
});

describe('performance monitoring', () => {
  const defaultNavigationTiming: Partial<PerformanceNavigationTiming> = {
    requestStart: 100,
    responseStart: 200,
    domInteractive: 300,
    loadEventEnd: 400,
  };
  let navigationTiming: PerformanceNavigationTiming | undefined;

  const setNavigationTiming = (
    overrides: Partial<PerformanceNavigationTiming> | null = {}
  ): void => {
    navigationTiming =
      overrides != null
        ? ({ ...defaultNavigationTiming, ...overrides } as PerformanceNavigationTiming)
        : undefined;
  };

  const createPaintEntry = (startTime: number = 300): PerformancePaintTiming =>
    ({ name: 'first-contentful-paint', startTime }) as PerformancePaintTiming;

  const completeDocument = (): void => {
    (globalThis.document as { readyState?: string }).readyState = 'complete';
  };

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.devvit = createMockDevvit();
    (globalThis as { window: Window }).window = {
      getComputedStyle: () => {},
      addEventListener: addEventListenerMock,
    } as unknown as Window;

    setNavigationTiming();
    vi.spyOn(performance, 'getEntriesByType').mockImplementation((type: string) =>
      type === 'navigation' && navigationTiming ? [navigationTiming] : []
    );
    initTelemetry();
  });

  it('only measures TTI for trusted DOMContentLoaded events', () => {
    globalThis.devvit.experiments = { devvit_require_trusted_events: 'enabled' };
    (globalThis.document as { readyState: string }).readyState = 'loading';
    addEventListenerMock.mockClear();
    initTelemetry();

    const onDOMContentLoaded = addEventListenerMock.mock.calls.find(
      (call) => call[0] === 'DOMContentLoaded'
    )?.[1];
    expect(onDOMContentLoaded).toBeDefined();

    const getEntriesByTypeMock = vi.mocked(performance.getEntriesByType);
    getEntriesByTypeMock.mockClear();

    onDOMContentLoaded?.({ isTrusted: false });
    expect(getEntriesByTypeMock).not.toHaveBeenCalled();

    onDOMContentLoaded?.(trustedEvent);
    expect(getEntriesByTypeMock).toHaveBeenCalledWith('navigation');
  });

  it('captures the TTFB reported by web-vitals', () => {
    triggerWindowEvent('load');
    triggerTtfb(navigationTiming, 150);

    expectMetric(
      'web_view_time_to_first_byte',
      performance.timeOrigin,
      performance.timeOrigin + 200
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_initialization',
      'web_view_time_to_interactive',
      'web_view_load',
    ]);
  });

  it('captures the FCP reported by web-vitals and uses its entry for render duration', () => {
    const paintEntry = createPaintEntry(300);

    triggerFcp(paintEntry, 250);
    triggerWindowEvent('load');

    expectMetric(
      'web_view_first_contentful_paint',
      performance.timeOrigin,
      performance.timeOrigin + 300
    );
    expectMetric(
      'web_view_render_duration',
      performance.timeOrigin + 200,
      performance.timeOrigin + 400
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_initialization',
      'web_view_time_to_interactive',
      'web_view_first_contentful_paint',
      'web_view_render_duration',
      'web_view_load',
    ]);
  });

  it('captures initialization, DOM interactive, and load milestones', () => {
    vi.spyOn(performance, 'now').mockReturnValue(400);

    triggerWindowEvent('load');

    expectMetric('web_view_initialization', 1717171717171, performance.timeOrigin);
    expectMetric(
      'web_view_time_to_interactive',
      performance.timeOrigin,
      performance.timeOrigin + 300
    );
    expectMetric('web_view_load', performance.timeOrigin, performance.timeOrigin + 400);
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_initialization',
      'web_view_time_to_interactive',
      'web_view_load',
    ]);
  });

  it('emits browser-timed metrics without a bridge start time', () => {
    vi.clearAllMocks();
    globalThis.devvit = { ...createMockDevvit(), startTime: undefined };
    vi.spyOn(performance, 'now').mockReturnValue(400);
    initTelemetry();

    triggerFcp(createPaintEntry());
    triggerWindowEvent('load');

    expectNoMetric('web_view_initialization');
    expectMetric(
      'web_view_time_to_interactive',
      performance.timeOrigin,
      performance.timeOrigin + 300
    );
    expectMetric(
      'web_view_first_contentful_paint',
      performance.timeOrigin,
      performance.timeOrigin + 300
    );
    expectMetric(
      'web_view_render_duration',
      performance.timeOrigin + 200,
      performance.timeOrigin + 400
    );
    expectMetric('web_view_load', performance.timeOrigin, performance.timeOrigin + 400);
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_time_to_interactive',
      'web_view_first_contentful_paint',
      'web_view_render_duration',
      'web_view_load',
    ]);
  });

  it.each([
    { name: 'load when load is later', fcpOffset: 300, renderEndOffset: 400 },
    { name: 'FCP when FCP is later', fcpOffset: 500, renderEndOffset: 500 },
  ])('ends late render duration at $name', ({ fcpOffset, renderEndOffset }) => {
    triggerWindowEvent('load');
    completeDocument();
    triggerTtfb(navigationTiming);
    postMessageMock.mockClear();

    triggerFcp(createPaintEntry(fcpOffset));

    expectMetric(
      'web_view_first_contentful_paint',
      performance.timeOrigin,
      performance.timeOrigin + fcpOffset
    );
    expectMetric(
      'web_view_render_duration',
      performance.timeOrigin + 200,
      performance.timeOrigin + renderEndOffset
    );
    expectMetricSpanNames(getFirstMetricsPayload(), [
      'web_view_first_contentful_paint',
      'web_view_render_duration',
    ]);
  });

  it('retries render duration on load when FCP and TTFB arrive before load timing completes', async () => {
    setNavigationTiming({ loadEventEnd: 0 });
    triggerFcp(createPaintEntry());
    triggerTtfb(navigationTiming);
    triggerWindowEvent('load');
    expectNoMetric('web_view_render_duration');

    Object.assign(navigationTiming!, { loadEventEnd: 400 });
    await new Promise((resolve) => setTimeout(resolve));

    expectMetric(
      'web_view_render_duration',
      performance.timeOrigin + 200,
      performance.timeOrigin + 400
    );
  });

  it.each([
    {
      name: 'FCP is unavailable',
      navigation: {},
      reportFcp: false,
      reportTtfb: true,
    },
    {
      name: 'navigation timing is unavailable',
      navigation: null,
      reportFcp: true,
      reportTtfb: false,
    },
    {
      name: 'responseStart is invalid',
      navigation: { responseStart: 0 },
      reportFcp: true,
      reportTtfb: false,
    },
    {
      name: 'loadEventEnd is unavailable',
      navigation: { loadEventEnd: 0 },
      reportFcp: true,
      reportTtfb: true,
    },
  ])(
    'does not capture render duration when $name',
    ({ navigation, reportFcp: shouldReportFcp, reportTtfb: shouldReportTtfb }) => {
      setNavigationTiming(navigation);
      if (shouldReportFcp) triggerFcp(createPaintEntry());
      triggerWindowEvent('load');
      if (shouldReportTtfb) triggerTtfb(navigationTiming);

      expectNoMetric('web_view_render_duration');
    }
  );

  it('sends a late FCP without render duration when responseStart is invalid', () => {
    setNavigationTiming({ responseStart: 0 });
    triggerWindowEvent('load');
    completeDocument();
    postMessageMock.mockClear();

    triggerFcp(createPaintEntry());

    expectMetric(
      'web_view_first_contentful_paint',
      performance.timeOrigin,
      performance.timeOrigin + 300
    );
    expectNoMetric('web_view_render_duration');
  });

  it('emits render duration once when callbacks repeat', () => {
    const paintEntry = createPaintEntry();
    triggerFcp(paintEntry);
    triggerWindowEvent('load');
    completeDocument();

    triggerTtfb(navigationTiming);
    triggerFcp(paintEntry);

    expect(
      getAllMetrics().filter((metric) => metric.spanName === 'web_view_render_duration')
    ).toHaveLength(1);
  });

  it.each([
    {
      name: 'FCP',
      spanName: 'web_view_first_contentful_paint',
      report: () => triggerFcp(undefined, 300),
    },
    {
      name: 'TTFB',
      spanName: 'web_view_time_to_first_byte',
      report: () => triggerTtfb(undefined, 200),
    },
  ])('ignores entry-less $name reports', ({ spanName, report }) => {
    report();
    triggerWindowEvent('load');

    expectNoMetric(spanName);
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
