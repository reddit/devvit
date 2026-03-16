import { devvitScriptUrl } from '@devvit/shared-types/web-view-scripts-constants.js';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { getScreenshotModuleUrl, initScreenshotRequestListener } from './screenshot-listener.js';

function registerListener(): (event: MessageEvent) => void {
  let listener: ((event: MessageEvent) => void) | undefined;
  globalThis.addEventListener = ((
    eventType: string,
    callback: EventListenerOrEventListenerObject
  ) => {
    if (eventType === 'message') {
      listener = callback as (event: MessageEvent) => void;
    }
  }) as typeof globalThis.addEventListener;
  initScreenshotRequestListener(devvitScriptUrl);
  expect(listener).toBeDefined();
  return listener as (event: MessageEvent) => void;
}

describe('screenshot-listener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    Object.defineProperty(globalThis, 'parent', {
      value: { postMessage: vi.fn() },
      writable: true,
      configurable: true,
    });
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
    listener({ data: { type: 'other-message', data: {} } } as MessageEvent);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('ignores devvit messages without screenshot request payload', () => {
    const listener = registerListener();
    listener({ data: { type: 'devvit-message', data: { id: 'req-noop' } } } as MessageEvent);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('ignores screenshot payloads without string request id', () => {
    const listener = registerListener();
    listener({
      data: {
        type: 'devvit-message',
        data: { id: 123, screenshotRequest: {} },
      },
    } as MessageEvent);
    expect(console.warn).not.toHaveBeenCalled();
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
