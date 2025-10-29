import { WebViewInternalMessageScope } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js';
import { afterEach, beforeEach, type Mock, test, vi } from 'vitest';

import { initAnalytics } from './analytics.js';

type EventListenerMock = Mock<[type: string, listener: () => void], void>;

const addEventListenerMock: EventListenerMock = vi.fn();
const docAddEventListenerMock: EventListenerMock = vi.fn();
const postMessageMock: EventListenerMock = vi.fn();

beforeEach(() => {
  globalThis.addEventListener = addEventListenerMock as unknown as typeof addEventListener;
  globalThis.document = {
    addEventListener: docAddEventListenerMock,
  } as unknown as Document;
  globalThis.parent = { postMessage: postMessageMock } as unknown as Window;
});

afterEach(() => {
  delete (globalThis as { document?: {} }).document;
  delete (globalThis as { parent?: {} }).parent;
  delete (globalThis as { addEventListener?: {} }).addEventListener;
});

test('sends click analytics on pointerdown', async () => {
  initAnalytics();

  const onClick = docAddEventListenerMock.mock.calls.find((call) => call[0] === 'pointerdown')?.[1];

  onClick?.();

  expect(postMessageMock).toHaveBeenCalledWith(
    {
      scope: WebViewInternalMessageScope.CLIENT,
      type: 'devvit-internal',
      analytics: { event: 'click' },
    },
    '*'
  );
});

test('sends load analytics on window load', async () => {
  initAnalytics();

  const onLoad = addEventListenerMock.mock.calls.find((call) => call[0] === 'load')?.[1];

  onLoad?.();

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
