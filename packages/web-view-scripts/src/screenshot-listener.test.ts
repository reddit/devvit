import type {
  WebViewInternalEventMessage,
  WebViewMessageEvent_MessageData,
} from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { devvitScriptUrl } from '@devvit/shared-types/web-view-scripts-constants.js';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import {
  getScreenshotModuleUrl,
  initScreenshotRequestListener,
  onMessage,
} from './screenshot-listener.js';

describe('screenshot-listener', () => {
  beforeEach(() => {
    globalThis.devvit = {} as DevvitGlobal;
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    Object.defineProperty(globalThis, 'parent', {
      value: { postMessage: vi.fn() },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (globalThis as { devvit?: DevvitGlobal }).devvit;
  });

  it('registers a message listener', () => {
    const addEventListenerMock: Mock = vi.fn();
    globalThis.addEventListener = addEventListenerMock as typeof globalThis.addEventListener;

    initScreenshotRequestListener(devvitScriptUrl);

    expect(addEventListenerMock).toHaveBeenCalledTimes(1);
    expect(addEventListenerMock.mock.calls[0][0]).toBe('message');
  });

  it('ignores non-devvit messages', () => {
    const listener = registerListener();
    listener(FakeMessageEvent({ type: 'other-message', data: {} as WebViewInternalEventMessage }));
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('ignores devvit messages without screenshot request payload', () => {
    const listener = registerListener();
    listener(FakeMessageEvent({ type: 'devvit-message', data: { id: 'req-noop' } }));
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('ignores screenshot payloads without string request id', () => {
    const listener = registerListener();
    listener(
      FakeMessageEvent({
        type: 'devvit-message',
        data: { id: 123 as unknown as string, screenshotRequest: {} },
      })
    );
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('ignores untrusted screenshot requests', async () => {
    globalThis.devvit.experiments = { devvit_require_trusted_events: 'enabled' };

    await onMessage(
      FakeMessageEvent(
        {
          type: 'devvit-message',
          data: { id: 'req-untrusted', screenshotRequest: {} },
        },
        false
      ),
      devvitScriptUrl
    );

    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it('responds to untrusted screenshot requests when trusted events are not required', async () => {
    await onMessage(
      FakeMessageEvent(
        {
          type: 'devvit-message',
          data: { id: 'req-control', screenshotRequest: {} },
        },
        false
      ),
      devvitScriptUrl
    );

    expect(parent.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'req-control' }),
      '*'
    );
  });

  it('responds to trusted screenshot requests', async () => {
    globalThis.devvit.experiments = { devvit_require_trusted_events: 'enabled' };

    await onMessage(
      FakeMessageEvent({
        type: 'devvit-message',
        data: {
          id: 'req-trusted',
          screenshotRequest: {},
        },
      }),
      devvitScriptUrl
    );

    expect(parent.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'req-trusted' }),
      '*'
    );
  });

  it('resolves screenshot module URL from devvit script src', () => {
    expect(
      getScreenshotModuleUrl(
        'https://webview.devvit.net/scripts/devvit.v1.min.js?clientVersion=1.2.3'
      )
    ).toBe('https://webview.devvit.net/scripts/screenshot.v1.min.js');
  });

  it('falls back to default screenshot module URL without devvit script', () => {
    expect(getScreenshotModuleUrl(undefined)).toBe(
      'https://webview.devvit.net/scripts/screenshot.v1.min.js'
    );
  });

  it('falls back to default screenshot module URL for non-devvit script src', () => {
    expect(getScreenshotModuleUrl('https://example.com/assets/main.js')).toBe(
      'https://webview.devvit.net/scripts/screenshot.v1.min.js'
    );
  });
});

function FakeMessageEvent(
  data: WebViewMessageEvent_MessageData,
  isTrusted: boolean = true
): MessageEvent {
  return { data, isTrusted } as MessageEvent;
}

function registerListener(): (ev: MessageEvent) => void {
  let listener: ((ev: MessageEvent) => void) | undefined;
  globalThis.addEventListener = ((
    eventType: string,
    callback: EventListenerOrEventListenerObject
  ) => {
    if (eventType === 'message') listener = callback as (ev: MessageEvent) => void;
  }) as typeof globalThis.addEventListener;
  initScreenshotRequestListener(devvitScriptUrl);
  expect(listener).toBeDefined();
  return listener as (ev: MessageEvent) => void;
}
