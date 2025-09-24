// @vitest-environment jsdom

import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { T2, T3, T5 } from '@devvit/shared-types/tid.js';
import { describe, expect, it, vi } from 'vitest';

import {
  addWebViewModeListener,
  exitExpandedMode,
  getWebViewMode,
  removeWebViewModeListener,
  requestExpandedMode,
} from '../index.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(() => Promise.resolve(undefined)),
}));

describe('showImmersiveMode', () => {
  beforeEach(() => {
    globalThis.devvit = {
      appPermissionState: undefined,
      context: {
        subredditId: T5('t5_subredditId'),
        subredditName: 'subredditName',
        userId: T2('t2_userId'),
        appName: 'appName',
        appVersion: '1.0.0',
        postId: T3('t3_postId'),
      },
      share: undefined,
      webViewMode: undefined,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should emit a message for immersive mode', () => {
    requestExpandedMode(trustedEvent);

    expect(emitEffect).toHaveBeenCalledWith({
      immersiveMode: {
        immersiveMode: 2 satisfies WebViewImmersiveMode.IMMERSIVE_MODE,
      },
      type: 9 satisfies EffectType.EFFECT_WEB_VIEW,
    });
  });

  it('should emit a message for inline mode', () => {
    exitExpandedMode(trustedEvent);

    expect(emitEffect).toHaveBeenCalledWith({
      immersiveMode: {
        immersiveMode: 1 satisfies WebViewImmersiveMode.INLINE_MODE,
      },
      type: 9 satisfies EffectType.EFFECT_WEB_VIEW,
    });
  });

  it('should throw an error when not called with an untrusted event or click event', async () => {
    const event = { isTrusted: false, type: 'click' } as PointerEvent;
    await expect(requestExpandedMode(event)).rejects.toThrow('Untrusted event');

    const trustedButWrongTypeEvent = { isTrusted: true, type: 'keydown' } as PointerEvent;
    await expect(requestExpandedMode(trustedButWrongTypeEvent)).rejects.toThrow('Untrusted event');
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
          immersiveModeEvent: {
            immersiveMode: mode,
          },
        },
      },
    });

    window.dispatchEvent(messageEvent);
  };

  const trustedEvent = { isTrusted: true, type: 'click' } as PointerEvent;
});
