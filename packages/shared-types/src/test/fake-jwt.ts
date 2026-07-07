import type {
  RequestContext,
  UserContext,
} from '@devvit/protos/json/devvit/platform/v1/request_context.js';

export type PartialRequestContext = Partial<Omit<RequestContext, 'user'>> & {
  user?: Partial<UserContext> & { devvit_loid?: string };
};

export function fakeContextJwt(reqCtx: Readonly<PartialRequestContext>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ devvit: reqCtx }));
  return `${header}.${payload}.`;
}
