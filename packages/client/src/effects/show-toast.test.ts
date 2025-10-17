import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type { ToastAppearance } from '@devvit/protos/json/devvit/ui/toast/toast.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { showToast } from './show-toast.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(),
}));

describe('showToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show a toast with just text', () => {
    const text = 'Hello, world!';
    showToast(text);

    expect(emitEffect).toHaveBeenCalledWith({
      showToast: {
        toast: {
          text,
        },
      },
      type: 4 satisfies EffectType.EFFECT_SHOW_TOAST,
    });
  });

  it('should show a toast with text and neutral appearance', () => {
    const toast = {
      text: 'Hello, world!',
      appearance: 'neutral' as const,
    };
    showToast(toast);

    expect(emitEffect).toHaveBeenCalledWith({
      showToast: {
        toast: {
          text: toast.text,
          appearance: 0 satisfies ToastAppearance.NEUTRAL,
        },
      },
      type: 4 satisfies EffectType.EFFECT_SHOW_TOAST,
    });
  });

  it('should show a toast with text and success appearance', () => {
    const toast = {
      text: 'Operation successful!',
      appearance: 'success' as const,
    };
    showToast(toast);

    expect(emitEffect).toHaveBeenCalledWith({
      showToast: {
        toast: {
          text: toast.text,
          appearance: 1 satisfies ToastAppearance.SUCCESS,
        },
      },
      type: 4 satisfies EffectType.EFFECT_SHOW_TOAST,
    });
  });
});
