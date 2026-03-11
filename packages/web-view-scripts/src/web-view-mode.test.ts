import { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { onWebViewMessage } from './web-view-mode.js';

describe('onWebViewMessage()', () => {
  beforeEach(() => {
    globalThis.devvit = {} as DevvitGlobal;
  });

  afterEach(() => {
    delete (globalThis as { devvit?: DevvitGlobal }).devvit;
  });

  test('updates mode on valid immersive mode message', () => {
    onWebViewMessage(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: {
            id: '',
            immersiveModeEvent: { immersiveMode: WebViewImmersiveMode.IMMERSIVE_MODE },
          },
        },
      })
    );
    expect(globalThis.devvit?.webViewMode).toBe(WebViewImmersiveMode.IMMERSIVE_MODE);
  });

  test('ignores messages with wrong type', () => {
    onWebViewMessage(
      new MessageEvent('message', {
        data: {
          type: 'other-message',
          data: {
            id: '',
            immersiveModeEvent: { immersiveMode: WebViewImmersiveMode.IMMERSIVE_MODE },
          },
        },
      })
    );
    expect(globalThis.devvit?.webViewMode).toBeUndefined();
  });

  test('ignores messages without immersiveModeEvent', () => {
    onWebViewMessage(
      new MessageEvent('message', {
        data: { type: 'devvit-message', data: { id: '' } },
      })
    );
    expect(globalThis.devvit?.webViewMode).toBeUndefined();
  });
});
