import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import type { WebbitToken } from '@devvit/shared-types/webbit.js';

export const updateRequestContext = async (): Promise<void> => {
  const updatedContext = await emitEffect({
    type: EffectType.EFFECT_UPDATE_REQUEST_CONTEXT,
    updateRequestContext: {},
  });

  if (updatedContext?.updateRequestContext) {
    devvit.token = updatedContext.updateRequestContext.signedRequestContext as WebbitToken;
  }
};
