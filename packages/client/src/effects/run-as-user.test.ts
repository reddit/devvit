import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import {
  ConsentStatus,
  Scope,
} from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import { emitEffectWithResponse } from '@devvit/shared-types/client/emit-effect.js';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { mockDevvit } from './helpers/test-helpers.js';
import { canRunAsUser } from './run-as-user.js';

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffectWithResponse: vi.fn(),
}));

function mockEmitEffect(consentStatus: ConsentStatus) {
  (emitEffectWithResponse as unknown as Mock).mockResolvedValue({
    id: '1',
    consentStatus: { consentStatus },
  });
}

describe('canRunAsUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.devvit = mockDevvit;
  });

  it('should return true if appPermissionState is not available', async () => {
    const result = await canRunAsUser();
    expect(result, 'result').toBe(true);
    expect(emitEffectWithResponse).not.toHaveBeenCalled();
  });

  it('should return false if consent has been revoked', async () => {
    globalThis.devvit.appPermissionState = {
      consentStatus: ConsentStatus.REVOKED,
      requestedScopes: [],
      grantedScopes: [],
    };
    const result = await canRunAsUser();
    expect(result, 'result').toBe(false);
    expect(emitEffectWithResponse).not.toHaveBeenCalled();
  });

  it('should return false if no scopes are requested', async () => {
    globalThis.devvit.appPermissionState = {
      consentStatus: ConsentStatus.GRANTED,
      requestedScopes: [],
      grantedScopes: [],
    };
    const result = await canRunAsUser();
    expect(result, 'result').toBe(false);
    expect(emitEffectWithResponse).not.toHaveBeenCalled();
  });

  it('should return true if consent is granted and all scopes are present', async () => {
    globalThis.devvit.appPermissionState = {
      consentStatus: ConsentStatus.GRANTED,
      requestedScopes: [Scope.SUBMIT_COMMENT, Scope.SUBMIT_POST],
      grantedScopes: [Scope.SUBMIT_COMMENT, Scope.SUBMIT_POST],
    };
    const result = await canRunAsUser();
    expect(result, 'result').toBe(true);
    expect(emitEffectWithResponse).not.toHaveBeenCalled();
  });

  it('should request consent if consent is granted but scopes are missing', async () => {
    globalThis.devvit.appPermissionState = {
      consentStatus: ConsentStatus.GRANTED,
      requestedScopes: [Scope.SUBMIT_COMMENT, Scope.SUBMIT_POST, Scope.SUBSCRIBE_TO_SUBREDDIT],
      grantedScopes: [Scope.SUBMIT_COMMENT, Scope.SUBMIT_POST],
    };
    mockEmitEffect(ConsentStatus.GRANTED);
    const result = await canRunAsUser();
    expect(emitEffectWithResponse).toHaveBeenCalledWith({
      type: 11 satisfies EffectType.EFFECT_CAN_RUN_AS_USER,
      canRunAsUser: {
        postId: globalThis.devvit.context.postId,
        appSlug: globalThis.devvit.context.appName,
        subredditId: globalThis.devvit.context.subredditId,
      },
    });
    expect(result, 'result').toBe(true);
  });

  it('should request consent if consent status is unknown', async () => {
    globalThis.devvit.appPermissionState = {
      consentStatus: ConsentStatus.CONSENT_STATUS_UNKNOWN,
      requestedScopes: [Scope.SUBMIT_COMMENT],
      grantedScopes: [],
    };
    mockEmitEffect(ConsentStatus.GRANTED);
    const result = await canRunAsUser();
    expect(emitEffectWithResponse).toHaveBeenCalledWith({
      type: 11 satisfies EffectType.EFFECT_CAN_RUN_AS_USER,
      canRunAsUser: {
        postId: globalThis.devvit.context.postId,
        appSlug: globalThis.devvit.context.appName,
        subredditId: globalThis.devvit.context.subredditId,
      },
    });
    expect(result, 'result').toBe(true);
  });

  it('should return false if consent is denied after requesting', async () => {
    globalThis.devvit.appPermissionState = {
      consentStatus: ConsentStatus.CONSENT_STATUS_UNKNOWN,
      requestedScopes: [Scope.SUBMIT_COMMENT],
      grantedScopes: [],
    };
    mockEmitEffect(ConsentStatus.REVOKED);
    const result = await canRunAsUser();
    expect(result, 'result').toBe(false);
  });
});
