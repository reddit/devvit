import type { OutgoingHttpHeader, OutgoingHttpHeaders, ServerResponse } from 'node:http';

import { WebViewUserProgressEffect_State } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/user_progress.js';
import {
  type UserProgressNotifier,
  type UserProgressState,
  userProgressStateHeader,
} from '@devvit/shared-types/user-progress.js';

/** Carries server SDK progress in response headers without changing the response body. */
export function createUserProgressNotifier(res: ServerResponse): UserProgressNotifier {
  let state: UserProgressState | undefined;
  const writeHead = res.writeHead.bind(res);
  res.writeHead = (
    statusCode: number,
    statusMessage?: string | OutgoingHttpHeaders | OutgoingHttpHeader[],
    headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]
  ) => {
    let responseHeaders = typeof statusMessage === 'string' ? headers : (statusMessage ?? headers);
    if (state) {
      const progressHeaders = {
        [userProgressStateHeader]: WebViewUserProgressEffect_State[state],
        'cache-control': 'private, no-store',
        'surrogate-control': 'no-store',
      };
      // writeHead headers override setHeader values. Remove both object and raw
      // array overrides before adding the authoritative notification headers.
      responseHeaders = Array.isArray(responseHeaders)
        ? responseHeaders.filter(
            (_value, index, values) =>
              !Object.hasOwn(progressHeaders, String(values[index - (index % 2)]).toLowerCase())
          )
        : Object.fromEntries(
            Object.entries(responseHeaders ?? {}).filter(
              ([name]) => !Object.hasOwn(progressHeaders, name.toLowerCase())
            )
          );
      for (const [name, value] of Object.entries(progressHeaders)) res.setHeader(name, value);
    }
    return typeof statusMessage === 'string'
      ? writeHead(statusCode, statusMessage, responseHeaders)
      : writeHead(statusCode, responseHeaders);
  };

  return (nextState) => {
    if (res.headersSent || res.destroyed) return;
    if (state !== WebViewUserProgressEffect_State.COMPLETED) state = nextState;
  };
}
