import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffectWithResponse } from '@devvit/shared-types/client/emit-effect.js';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockDevvit } from './helpers/test-helpers.js';
import { updateRequestContext } from './update-request-context.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffectWithResponse: vi.fn(),
}));

function mockEmitEffect(context: string) {
  (emitEffectWithResponse as unknown as Mock).mockResolvedValue({
    id: EffectType.EFFECT_UPDATE_REQUEST_CONTEXT,
    updateRequestContext: { signedRequestContext: context },
  });
}

beforeEach(() => {
  globalThis.devvit = mockDevvit;
});

afterEach(() => {
  delete (globalThis as { devvit?: {} }).devvit;
  vi.clearAllMocks();
});

describe('update request context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle a signed request context message', async () => {
    const token = 'new.signed.request-context';
    mockEmitEffect(token);

    await updateRequestContext();

    expect(emitEffectWithResponse).toHaveBeenCalledWith({
      updateRequestContext: {},
      type: EffectType.EFFECT_UPDATE_REQUEST_CONTEXT,
    });

    expect(globalThis.devvit.token).toStrictEqual(token);
  });
});
