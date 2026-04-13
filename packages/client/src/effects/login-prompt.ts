import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

/**
 * Opens a Reddit login/signup prompt.
 */
export function showLoginPrompt(): void {
  void emitEffect({
    type: EffectType.EFFECT_LOGIN_PROMPT,
    loginPrompt: {},
  });
}
