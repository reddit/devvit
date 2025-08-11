/* eslint-disable @typescript-eslint/no-explicit-any */

import type { IncomingMessage, Server, ServerOptions, ServerResponse } from 'node:http';
import { createServer as nodeCreateServer } from 'node:http';

import type { Metadata } from '@devvit/protos';
import type { FormField } from '@devvit/shared';

import { getMetadata, runWithContext } from './context.js';
import { Context } from './server-context.js';

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

  const server = nodeCreateServer(options, async (req, res) => {
    const context = Context(req.headers);
    return runWithContext(context, async () => {
      return requestListener?.(req, res);
    });
  });

  // Modify the listen callback slightly, to do the Devvit-y bundling hack
  // TODO: When we stop needing to execute code in the bundler, we can remove this. I suspect once
  //  devvit.json is fully implemented, we won't need this anymore.
  const originalListen = server.listen.bind(server);
  server.listen = (...args: any[]) => {
    // Yes we're using `any` here - we don't care about the types of the arguments, we just want to
    // make sure we call the original listen function with the same arguments, and sadly using
    // unknown here doesn't work.
    if (globalThis.enableWebbitBundlingHack) {
      // This is a hack to get around the fact that we use a side effect import to start the server in
      // prod, but we really don't want to do that when we're just running the code to bundle it.
      // We'll set this global variable in the bundler, and then we can check it here to see if we
      // should actually start the server or not.
      return server;
    }
    return originalListen(...args);
  };

  return server;
}

// TODO When we remove the server.listen hack above, remove this too, along with the matching code in
//  packages/build-pack/src/esbuild/BundleModule.ts
declare global {
  namespace globalThis {
    // eslint-disable-next-line no-var
    var enableWebbitBundlingHack: boolean;
    // eslint-disable-next-line no-var
    var devvit: {
      metadataProvider?: () => Readonly<Metadata> | undefined;
      settings?: {
        app?: FormField[] | undefined;
        installation?: FormField[] | undefined;
      };
    };
  }
}
