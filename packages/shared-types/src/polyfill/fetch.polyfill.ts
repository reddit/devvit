import type { HTTP as HTTPPlugin } from '@devvit/protos';
import { HTTPDefinition } from '@devvit/protos';

import type {} from '../shared/devvit-worker-global.js';

export const WEBBIT_LOCAL_HOST = 'webbit.local';

let httpPlugin: HTTPPlugin | undefined;
const noDevvitFetch: typeof fetch = globalThis.fetch;
const webbitHost: string = `${WEBBIT_LOCAL_HOST}:${process.env.WEBBIT_PORT || '3000'}`;

function getHttpPlugin(): HTTPPlugin {
  if (httpPlugin !== undefined) {
    return httpPlugin;
  }

  const config = globalThis?.devvit?.config;

  if (!config?.uses?.(HTTPDefinition)) {
    throw new Error(
      'Fetch is not enabled. You can enable it by passing `http: true` to `Devvit.configure`'
    );
  }

  const handler = config?.use?.(HTTPDefinition) ?? null;

  if (handler === null) {
    throw new Error('fetch polyfill failed to initialize HTTPPlugin');
  }

  return handler as unknown as HTTPPlugin;
}

globalThis.fetch = async function fetch(
  request: RequestInfo | URL,
  options?: RequestInit
): Promise<Response> {
  let requestObj = request;
  if (typeof requestObj === 'string' || requestObj instanceof URL || requestObj !== undefined) {
    requestObj = new Request(request, options);
  }

  if (new URL(requestObj.url).host === webbitHost) {
    // In local development and integration tests, we can't map
    // webbit.local to 127.0.0.1 via hosts, so we replace it here.
    const newUrl = requestObj.url.replace(`http://${WEBBIT_LOCAL_HOST}:`, `http://127.0.0.1:`);
    const newRequest = new Request(newUrl, requestObj);
    return noDevvitFetch(newRequest, options);
  }

  const fetchPlugin = getHttpPlugin();

  const headers: { [k: string]: string } = {};
  requestObj.headers.forEach((v, k) => (headers[k] = v));
  const pluginResponse = await fetchPlugin.Fetch({
    url: requestObj.url,
    data: {
      method: requestObj.method,
      headers,
      body: new Uint8Array(await requestObj.arrayBuffer()),
    },
  });

  let body: Uint8Array | undefined = pluginResponse.body;
  if (pluginResponse.status === 204 || pluginResponse.status === 304) {
    body = undefined;
  }

  const rsp = new Response(body, {
    headers: pluginResponse.headers,
    status: pluginResponse.status,
  });
  // Redefine the url prop with new value but same as it was.
  Object.defineProperty(rsp, 'url', {
    configurable: true,
    enumerable: true,
    value: pluginResponse.url,
  });
  return rsp;
};
