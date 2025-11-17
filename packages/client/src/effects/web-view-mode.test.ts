// @vitest-environment jsdom

import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import type { WebViewMessageEvent } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import { type Effect, emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { noWebbitToken } from '@devvit/shared-types/webbit.js';
import { describe, expect, it, vi } from 'vitest';

import {
  addWebViewModeListener,
  exitExpandedMode,
  getWebViewMode,
  registerListener,
  removeWebViewModeListener,
  requestExpandedMode,
} from './web-view-mode.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(() => Promise.resolve(undefined)),
}));

const sendEvent = (mode: WebViewImmersiveMode) => {
  const messageEvent = new MessageEvent('message', {
    data: {
      type: 'devvit-message',
      data: {
        id: 'id',
        immersiveModeEvent: { immersiveMode: mode },
      },
    },
  } satisfies WebViewMessageEvent);

  dispatchEvent(messageEvent);
};

const trustedEvent = { isTrusted: true, type: 'click' } as PointerEvent;

beforeEach(() => {
  globalThis.devvit = {
    appPermissionState: undefined,
    dependencies: { client: undefined, webViewScripts: { hash: 'abc', version: '1.2.3' } },
    entrypoints: {
      default: 'https://corridor-game-csipc4-0-0-9-webview.devvit.net/index.html',
      splash: 'https://corridor-game-csipc4-0-0-9-webview.devvit.net/splash.html',
    },
    context: {
      appName: 'appName',
      appVersion: '1.0.0',
      client: undefined,
      postAuthorId: undefined,
      postData: undefined,
      postId: 't3_postId',
      snoovatar: undefined,
      subredditId: 't5_subredditId',
      subredditName: 'subredditName',
      userId: 't2_userId',
      username: 'username',
    },
    share: undefined,
    token: noWebbitToken,
    webViewMode: undefined,
  };
  registerListener();
});

afterEach(() => {
  delete (globalThis as { devvit?: {} }).devvit;
  vi.clearAllMocks();
});

describe('requestExpandedMode()', () => {
  it('should emit a message for expanded mode', () => {
    requestExpandedMode(trustedEvent, 'default');

    expect(emitEffect).toHaveBeenCalledWith({
      immersiveMode: {
        entryUrl: 'https://corridor-game-csipc4-0-0-9-webview.devvit.net/index.html?token=0.0.0',
        immersiveMode: WebViewImmersiveMode.IMMERSIVE_MODE,
      },
      type: EffectType.EFFECT_WEB_VIEW,
    } satisfies Effect);
  });

  it('should emit a message for expanded mode nondefault entry', () => {
    requestExpandedMode(trustedEvent, 'splash');

    expect(emitEffect).toHaveBeenCalledWith({
      immersiveMode: {
        entryUrl: 'https://corridor-game-csipc4-0-0-9-webview.devvit.net/splash.html?token=0.0.0',
        immersiveMode: WebViewImmersiveMode.IMMERSIVE_MODE,
      },
      type: EffectType.EFFECT_WEB_VIEW,
    } satisfies Effect);
  });

  it('should throw an error when not called with an untrusted event or click event', async () => {
    const event = { isTrusted: false, type: 'click' } as PointerEvent;
    await expect(requestExpandedMode(event, 'default')).rejects.toThrow('Untrusted event');

    const trustedButWrongTypeEvent = { isTrusted: true, type: 'keydown' } as PointerEvent;
    await expect(requestExpandedMode(trustedButWrongTypeEvent, 'default')).rejects.toThrow(
      'Untrusted event'
    );
  });

  test('typing supports `MouseEvent`s for React', async () => {
    const ev = { isTrusted: true, type: 'click' } as MouseEvent;
    await requestExpandedMode(ev, 'default');
  });

  it('should throw an error when entrypoint does not exist in devvit.json', async () => {
    // to-do: tighten Event checking.
    const ev = { isTrusted: true, type: 'click' } as PointerEvent;
    await expect(requestExpandedMode(ev, 'missing')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: no entrypoint named "missing"; all entrypoints must appear in \`devvit.json\` \`post.entrypoints\`]`
    );
  });

  test('should throw an error when requestExpandedMode is called while already expanded', () => {
    globalThis.devvit.webViewMode = WebViewImmersiveMode.IMMERSIVE_MODE;
    expect(() => requestExpandedMode(trustedEvent, 'default')).toThrow(
      'web view is already expanded'
    );
  });

  it('should call listeners when a message event is received', () => {
    const callback = vi.fn();
    addWebViewModeListener(callback);

    sendEvent(WebViewImmersiveMode.IMMERSIVE_MODE);
    expect(callback).toHaveBeenCalledWith('expanded');

    sendEvent(WebViewImmersiveMode.INLINE_MODE);
    expect(callback).toHaveBeenCalledWith('inline');
  });

  it('should cleanup listeners', () => {
    const callback = vi.fn();
    addWebViewModeListener(callback);

    sendEvent(WebViewImmersiveMode.IMMERSIVE_MODE);
    expect(callback).toHaveBeenCalledWith('expanded');

    removeWebViewModeListener(callback);
    callback.mockReset();

    sendEvent(WebViewImmersiveMode.IMMERSIVE_MODE);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should maintain the state of immersive mode', async () => {
    expect(getWebViewMode()).toBe('inline');

    // transitioning to immersive
    sendEvent(WebViewImmersiveMode.IMMERSIVE_MODE);
    expect(getWebViewMode()).toBe('expanded');

    // transition back to inline
    sendEvent(WebViewImmersiveMode.INLINE_MODE);
    expect(getWebViewMode()).toBe('inline');
  });
});

describe('exitExpandedMode()', () => {
  it('should emit a message for inline mode', () => {
    exitExpandedMode(trustedEvent);

    expect(emitEffect).toHaveBeenCalledWith({
      immersiveMode: {
        entryUrl: undefined,
        immersiveMode: WebViewImmersiveMode.INLINE_MODE,
      },
      type: EffectType.EFFECT_WEB_VIEW,
    } satisfies Effect);
  });

  test('error when already inlined', () => {
    globalThis.devvit.webViewMode = WebViewImmersiveMode.INLINE_MODE;
    expect(() => exitExpandedMode(trustedEvent)).toThrow('web view is already inlined');
  });
});
