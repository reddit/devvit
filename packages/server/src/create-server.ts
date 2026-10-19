/* eslint-disable @typescript-eslint/no-explicit-any */

import '@devvit/shared-types/shared/devvit-worker-global.js';

import type { IncomingMessage, Server, ServerOptions, ServerResponse } from 'node:http';
import { createServer as nodeCreateServer } from 'node:http';

import { userProgressStateHeader } from '@devvit/shared-types/user-progress.js';

import { getMetadata, runWithContext, setContextCache } from './context.js';
import { Context } from './server-context.js';
import { createUserProgressNotifier } from './user-progress.js';

/**
 * Creates a new Devvit server. This implements the same API as Node.js's `createServer` function,
 * but we do not guarantee that this actually creates an HTTP server of any kind - it may be any
 * kind of server under the hood. However, it will behave like an HTTP server in terms of the API.
 */
export const createServer = <
  Request extends typeof IncomingMessage = typeof IncomingMessage,
  Response extends typeof ServerResponse = typeof ServerResponse,
>(
  optionsOrRequestListener?:
    | ServerOptions<Request, Response>
    | ((
        req: InstanceType<Request>,
        res: InstanceType<Response> & { req: InstanceType<Request> }
      ) => any),
  requestListener?: (
    req: InstanceType<Request>,
    res: InstanceType<Response> & { req: InstanceType<Request> }
  ) => any
): Server<Request, Response> => {
  if (typeof optionsOrRequestListener === 'function') {
    return _createServer<Request, Response>({}, optionsOrRequestListener);
  }

  return _createServer<Request, Response>(optionsOrRequestListener ?? {}, requestListener);
};

function _createServer<
  Request extends typeof IncomingMessage = typeof IncomingMessage,
  Response extends typeof ServerResponse = typeof ServerResponse,
>(
  options: ServerOptions<Request, Response>,
  requestListener?: (
    req: InstanceType<Request>,
    res: InstanceType<Response> & { req: InstanceType<Request> }
  ) => any
): Server<Request, Response> {
  globalThis.devvit ??= {};
  globalThis.devvit.metadataProvider = getMetadata;

  return nodeCreateServer(options, async (req, res) => {
    const context = Context(req.headers);
    return runWithContext(context, async () => {
      setContextCache(userProgressStateHeader, createUserProgressNotifier(res));
      return requestListener?.(req, res);
    });
  });
}
