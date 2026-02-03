import { WebViewInternalMessageScope } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js';
import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { webViewInternalMessageType } from '@devvit/shared-types/client/emit-effect.js';
import type { WebbitToken } from '@devvit/shared-types/webbit.js';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, it, type Mock, vi } from 'vitest';

import { initAnalytics } from './analytics.js';

type EventListenerMock = Mock<(type: string, listener: (event: unknown) => void) => void>;

const addEventListenerMock: EventListenerMock = vi.fn();
const docAddEventListenerMock: EventListenerMock = vi.fn();
const postMessageMock: EventListenerMock = vi.fn();

const createMockDevvit = (): DevvitGlobal => ({
  context: {} as DevvitGlobal['context'],
  dependencies: { client: undefined, webViewScripts: { hash: 'abc', version: '1.2.3' } },
  entrypoints: {},
  share: undefined,
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
describe('analytics', () => {
  const deadClick = { target: renderDom(`<div>div</div>`), isTrusted: true };

  beforeEach(() => {
    initAnalytics();
  });

  it('sends click analytics on click', async () => {
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
        `<style>div{cursor: pointer}</style><div id="target">div cursor pointer</div>`
      );
      const window = page.window as unknown as Window;
      // Dirty casting magic to avoid TS errors
      (globalThis as { window: Window }).window = window;

      const divWithCursorPointer = window.document.getElementById('target');

      onClick(constructClickEvent({ target: divWithCursorPointer }));
      expect(postMessageMock).toHaveBeenCalledWith(...clickPostMessageWithDefinition('strict'));
    });

    it('adds the strict flag if click target is a descendant of an a, button, canvas, input, select, textarea, label element', () => {
      const onClick = getGlobalClickListener();
      const buttonWithChildren = renderDom(`<button class="toplevel-btn">
          <img alt="snoo"/>
          <div class="useless-wrapper">
            <span id="target">Click Me!</span>
          </div>
        </button>`);
      const targetSpan = buttonWithChildren.querySelector('#target');

      onClick(constructClickEvent({ target: targetSpan }));
      expect(postMessageMock).toHaveBeenCalledWith(...clickPostMessageWithDefinition('strict'));
    });

    it('adds the strict flag if click target is a descendant of a contenteditable element', () => {
      const onClick = getGlobalClickListener();
      const buttonWithChildren = renderDom(`<div contenteditable="true">
          <img alt="snoo"/>
          <div class="useless-wrapper">
            <span id="target">Click Me!</span>
          </div>
        </div>`);
      const targetSpan = buttonWithChildren.querySelector('#target');

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
});

it('sends load analytics on window load', async () => {
  initAnalytics();

  const onLoad = addEventListenerMock.mock.calls.find((call) => call[0] === 'load')?.[1];

  onLoad?.({});

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
        observe(options: { entryTypes: string[] }) {
          // Store callback by entry type for later triggering
          options.entryTypes.forEach((type) => {
            observerCallbacks[type] = this.#callback;
          });
        }
        disconnect() {}
        static supportedEntryTypes = ['paint', 'longtask'];
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

    initAnalytics();
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
                timeStart: 1717171717171,
                timeEnd: 1717171717171 + 300,
              },
            ]),
          },
        },
      }),
      '*'
    );
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
                timeStart: 1717171717171,
                timeEnd: 1717171717171 + 300,
              },
            ]),
          },
        },
      }),
      '*'
    );
  });
});

const renderDom = (htmlFragment: string): HTMLElement => {
  return new JSDOM(`<div id="wrapper">${htmlFragment}</div>`).window.document.getElementById(
    'wrapper'
  )!.childNodes[0]! as HTMLElement;
};

const getGlobalClickListener = () => {
  return docAddEventListenerMock.mock.calls.find((call) => call[0] === 'click')?.[1]!;
};

const clickPostMessageWithDefinition = (definition: string): [unknown, string] => {
  return [
    {
      scope: WebViewInternalMessageScope.CLIENT,
      type: webViewInternalMessageType,
      analytics: { event: 'click', definition },
      realtimeEffect: undefined,
      telemetry: { event: 'click', click: { event: 'click', definition } },
    },
    '*',
  ];
};
