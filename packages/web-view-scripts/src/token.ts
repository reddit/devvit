import type { RequestContext } from '@devvit/protos/json/devvit/platform/v1/request_context.js';
import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import type { WebbitToken } from '@devvit/shared-types/webbit.js';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

import { updateToken } from './devvit-global.js';

/**
 * Claims payload extracted from a Devvit JWT.
 * This represents a JSON Web Token (JWT) that holds the `devvit` platform request context
 */
type ContextClaims = JwtPayload & { devvit: RequestContext };

export function decodeToken(token: string | undefined): RequestContext | undefined {
  if (!token) return;

  try {
    return jwtDecode<ContextClaims>(token)?.devvit;
  } catch (err) {
    throw Error('token decode failure', { cause: err });
  }
}

export function initToken(): void {
  setInterval(refreshToken, 60_000);
}

/** @internal */
export async function refreshToken(): Promise<void> {
  // Check if the token is about to expire in the next 5 minutes
  const { exp: expiresAt } = jwtDecode<ContextClaims>(globalThis.devvit.token);

  if (expiresAt && expiresAt - Date.now() / 1000 > 300) {
    return;
  }

  await requestTokenRefresh();
}

export async function requestTokenRefresh(): Promise<void> {
  const response = await emitEffect({
    type: EffectType.EFFECT_UPDATE_REQUEST_CONTEXT,
    updateRequestContext: {},
  });

  if (!response?.updateRequestContext?.signedRequestContext) {
    console.error('Failed to refresh token');
    return;
  }

  updateToken(response.updateRequestContext.signedRequestContext as WebbitToken);
}
