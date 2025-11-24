import type { RequestContext } from '@devvit/protos/json/devvit/platform/v1/request_context.js';
import { jwtDecode } from 'jwt-decode';

// to-do: make a Protobuf for ContextClaims.
export type ContextClaims = { devvit: RequestContext };

export function decodeToken(token: string | undefined): RequestContext | undefined {
  if (!token) return;

  try {
    return jwtDecode<ContextClaims>(token)?.devvit;
  } catch (err) {
    throw Error('token decode failure', { cause: err });
  }
}
