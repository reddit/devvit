import crypto from 'node:crypto';
import http from 'node:http';
import url from 'node:url';
import { errorPage, handleError, loginSuccess } from './login-view.js';

export type LocalCodeServerConfig<T> = {
  /** The port to use for the server. If 0 or not given, a random available port will be chosen. */
  port?: number;
  /**
   *  The state string to use with the server. All requests will be ignored unless this state is
   *  provided as a query param. If omitted, a random state string will be generated.
   */
  state?: string;
  /**
   * Called when the server is listening. This is useful if you're using a random port and need to
   * know what port and/or state was chosen.
   * @param info Information about the server, including the port and state string.
   */
  serverListeningCallback?: (info: LocalCodeServerCallbackInfo) => void;
  /**
   * Handle a request to the server. This is called when the user visits the server URL. This will
   * only be called if the `state` was correct, so you don't need to check it yourself.
   * @param queryParams Query params from the request
   * @param resp The response object, if you want to write a custom response
   * @returns {<T> | false} false if the code was invalid & we should keep trying, otherwise
   *   whatever you want to return
   * @throws Error if there was an error of some kind, and the server should be shut down
   */
  requestHandler: (
    queryParams: Record<string, string | string[] | undefined>,
    resp: http.ServerResponse
  ) => Promise<T | false>;
};
export type LocalCodeServerCallbackInfo = {
  port: number;
  state: string;
};

export async function localCodeServer<T>(config: LocalCodeServerConfig<T>): Promise<T> {
  const state = config.state ?? crypto.randomBytes(16).toString('hex');

  const server = http.createServer();
  const promise = new Promise<T>((resolve, reject) => {
    server.on('request', (req, res: http.ServerResponse) => {
      const { query } = url.parse(req.url || '', true);

      // ignore requests that don't have query params or don't match the state
      if (!query || query.state !== state) {
        res.writeHead(401);
        res.end();
        return;
      }

      // pass all other requests to the handler
      config.requestHandler(query, res).then(
        (code) => {
          if (code !== false) {
            // code is valid, so we're done
            if (!res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.write(loginSuccess());
              res.end();
            }
            server.close();
            resolve(code);
          } else {
            // code is invalid, so keep trying
            if (!res.headersSent) {
              res.writeHead(401);
              res.write(errorPage('Something went wrong. Please try again.'));
              res.end();
            }
          }
        },
        (err) => {
          // error occurred, so shut down the server
          if (!res.headersSent) {
            handleError(res, err);
          }
          reject(err);
        }
      );
    });
  });

  server.listen(config.port ?? 0); // 0 == use a random port
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw Error('Failed to get server address - address is not an object');
  }
  if (config.serverListeningCallback) {
    config.serverListeningCallback({
      port: address.port,
      state,
    });
  }

  try {
    const code = await promise;
    server.close();
    return code;
  } catch (e) {
    server.close();
    throw e;
  }
}
