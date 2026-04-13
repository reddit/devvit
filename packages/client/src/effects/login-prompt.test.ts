import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { showLoginPrompt } from './login-prompt.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffect: vi.fn(),
}));

describe('showLoginPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('emits a login prompt effect', () => {
    showLoginPrompt();

    expect(emitEffect).toHaveBeenCalledWith({
      type: EffectType.EFFECT_LOGIN_PROMPT,
      loginPrompt: {},
    });
  });
});
