import { WebViewInternalMessageScope } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, it, type Mock, vi } from 'vitest';

import { initAnalytics } from './analytics.js';

type EventListenerMock = Mock<[type: string, listener: (event: unknown) => void], void>;

const addEventListenerMock: EventListenerMock = vi.fn();
const docAddEventListenerMock: EventListenerMock = vi.fn();
const postMessageMock: EventListenerMock = vi.fn();

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
      type: 'devvit-internal',
      analytics: {
        event: 'web-view-loaded',
        timeStart: expect.any(Number),
        timeEnd: expect.any(Number),
        duration: expect.any(Number),
      },
    },
    '*'
  );
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
      type: 'devvit-internal',
      analytics: { event: 'click', definition },
    },
    '*',
  ];
};
