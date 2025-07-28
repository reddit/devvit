import type { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import { WebViewImmersiveMode } from '@devvit/protos/types/devvit/ui/effects/web_view/v1alpha/immersive_mode.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { exitImmersiveMode, requestImmersiveMode } from './immersive-mode.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(() => Promise.resolve(undefined)),
}));

describe('showImmersiveMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should emit a message for immersive mode', () => {
    const event = new Event('test');
    Object.defineProperty(event, 'isTrusted', {
      get: () => true,
      configurable: true,
    });

    requestImmersiveMode(event);

    expect(emitEffect).toHaveBeenCalledWith({
      immersiveMode: {
        immersiveMode: 2 satisfies WebViewImmersiveMode.IMMERSIVE_MODE,
      },
      type: 9 satisfies EffectType.EFFECT_WEB_VIEW,
    });
  });

  it('should emit a message for inline mode', () => {
    const event = new Event('test');
    Object.defineProperty(event, 'isTrusted', {
      get: () => true,
      configurable: true,
    });

    exitImmersiveMode(event);

    expect(emitEffect).toHaveBeenCalledWith({
      immersiveMode: {
        immersiveMode: 1 satisfies WebViewImmersiveMode.INLINE_MODE,
      },
      type: 9 satisfies EffectType.EFFECT_WEB_VIEW,
    });
  });

  it('should throw an error when not called with an untrusted event', async () => {
    const event = new Event('test');
    await expect(requestImmersiveMode(event)).rejects.toThrow('Untrusted event');
  });
});
