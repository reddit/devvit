// @vitest-environment jsdom

import { WebViewImmersiveMode } from '@devvit/protos/types/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import { describe, expect, it, vi } from 'vitest';

import {
  addImmersiveModeChangeEventListener,
  removeImmersiveModeChangeEventListener,
} from './immersive-mode.js';

describe('showImmersiveMode', () => {
  it('should call listeners when a message event is received', () => {
    const callback = vi.fn();
    addImmersiveModeChangeEventListener(callback);

    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'devvit-message',
        data: {
          immersiveModeEvent: {
            immersiveMode: 2 satisfies WebViewImmersiveMode.IMMERSIVE_MODE,
          },
        },
      },
    });

    window.dispatchEvent(messageEvent);
    expect(callback).toHaveBeenCalledWith('immersive');

    messageEvent.data.data.immersiveModeEvent.immersiveMode =
      1 satisfies WebViewImmersiveMode.INLINE_MODE;
    window.dispatchEvent(messageEvent);
    expect(callback).toHaveBeenCalledWith('inline');
  });

  it('should cleanup listeners', () => {
    const callback = vi.fn();
    addImmersiveModeChangeEventListener(callback);

    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'devvit-message',
        data: {
          immersiveModeEvent: {
            immersiveMode: 2 satisfies WebViewImmersiveMode.IMMERSIVE_MODE,
          },
        },
      },
    });

    window.dispatchEvent(messageEvent);
    expect(callback).toHaveBeenCalledWith('immersive');

    removeImmersiveModeChangeEventListener(callback);
    callback.mockReset();

    window.dispatchEvent(messageEvent);
    expect(callback).not.toHaveBeenCalled();
  });
});
