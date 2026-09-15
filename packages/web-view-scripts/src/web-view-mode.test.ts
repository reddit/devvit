import { WebViewImmersiveMode } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import type { WebViewMessageEvent_MessageData } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
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
    globalThis.devvit.experiments = { devvit_require_trusted_events: 'enabled' };

    onWebViewMessage({
      isTrusted: true,
      data: {
        type: 'devvit-message',
        data: {
          id: '',
          immersiveModeEvent: { immersiveMode: WebViewImmersiveMode.IMMERSIVE_MODE },
        },
      },
    } as MessageEvent<WebViewMessageEvent_MessageData>);
    expect(globalThis.devvit?.webViewMode).toBe(WebViewImmersiveMode.IMMERSIVE_MODE);
  });

  test('ignores messages with wrong type', () => {
    onWebViewMessage({
      isTrusted: true,
      data: {
        type: 'other-message',
        data: {
          id: '',
          immersiveModeEvent: { immersiveMode: WebViewImmersiveMode.IMMERSIVE_MODE },
        },
      },
    } as MessageEvent<WebViewMessageEvent_MessageData>);
    expect(globalThis.devvit?.webViewMode).toBeUndefined();
  });

  test('ignores messages without immersiveModeEvent', () => {
    onWebViewMessage({
      isTrusted: true,
      data: { type: 'devvit-message', data: { id: '' } },
    } as MessageEvent<WebViewMessageEvent_MessageData>);
    expect(globalThis.devvit?.webViewMode).toBeUndefined();
  });

  test('ignores untrusted immersive mode messages', () => {
    globalThis.devvit.experiments = { devvit_require_trusted_events: 'enabled' };

    onWebViewMessage({
      isTrusted: false,
      data: {
        type: 'devvit-message',
        data: {
          id: '',
          immersiveModeEvent: { immersiveMode: WebViewImmersiveMode.IMMERSIVE_MODE },
        },
      },
    } as MessageEvent<WebViewMessageEvent_MessageData>);

    expect(globalThis.devvit?.webViewMode).toBeUndefined();
  });

  test('handles untrusted immersive mode messages when trusted events are not required', () => {
    onWebViewMessage({
      isTrusted: false,
      data: {
        type: 'devvit-message',
        data: {
          id: '',
          immersiveModeEvent: { immersiveMode: WebViewImmersiveMode.IMMERSIVE_MODE },
        },
      },
    } as MessageEvent<WebViewMessageEvent_MessageData>);

    expect(globalThis.devvit?.webViewMode).toBe(WebViewImmersiveMode.IMMERSIVE_MODE);
  });
});
