// @vitest-environment jsdom

import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import type { WebViewMessageEvent } from '@devvit/protos/types/devvit/ui/events/v1alpha/web_view.js';
import { type Effect, emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { T2, T3, T5 } from '@devvit/shared-types/tid.js';
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

describe('showImmersiveMode', () => {
  beforeEach(() => {
    globalThis.devvit = {
      appPermissionState: undefined,
      entrypoints: {
        default: 'https://corridor-game-csipc4-0-0-9-webview.devvit.net/index.html',
        splash: 'https://corridor-game-csipc4-0-0-9-webview.devvit.net/splash.html',
      },
      context: {
        subredditId: T5('t5_subredditId'),
        subredditName: 'subredditName',
        userId: T2('t2_userId'),
        appName: 'appName',
        appVersion: '1.0.0',
        postId: T3('t3_postId'),
      },
      share: undefined,
      webbitToken: noWebbitToken,
      webViewMode: undefined,
    };
    registerListener();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit a message for immersive mode', () => {
    requestExpandedMode(trustedEvent, 'default');

    expect(emitEffect).toHaveBeenCalledWith({
      immersiveMode: {
        entryUrl: 'https://corridor-game-csipc4-0-0-9-webview.devvit.net/index.html',
        immersiveMode: WebViewImmersiveMode.IMMERSIVE_MODE,
      },
      type: EffectType.EFFECT_WEB_VIEW,
    } satisfies Effect);
  });

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

  it('should throw an error when not called with an untrusted event or click event', async () => {
    const event = { isTrusted: false, type: 'click' } as PointerEvent;
    await expect(requestExpandedMode(event, 'default')).rejects.toThrow('Untrusted event');

    const trustedButWrongTypeEvent = { isTrusted: true, type: 'keydown' } as PointerEvent;
    await expect(requestExpandedMode(trustedButWrongTypeEvent, 'default')).rejects.toThrow(
      'Untrusted event'
    );
  });

  it('should throw an error when entrypoint does not exist in devvit.json', async () => {
    // to-do: tighten Event checking.
    const ev = { isTrusted: true, type: 'click' } as PointerEvent;
    await expect(requestExpandedMode(ev, 'missing')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: no entrypoint named "missing"; all entrypoints must appear in \`devvit.json\` \`post.entrypoints\`]`
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
});
