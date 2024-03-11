import type { HttpOverride } from './types.js';
import type { HandlerOverride } from '../types/internal.js';
import type { JSONValue } from '@devvit/public-api/public-api.js';

export const createDevvFetch = (
  realFetch: typeof fetch,
  overrides: HttpOverride[]
): typeof fetch => {
  if (!overrides.length) {
    return realFetch;
  }
  return (url, request) => {
    const matchingOverride = overrides.find((override) => {
      return override.url === url && override.method === (request?.method ?? '').toUpperCase();
    });

    if (!matchingOverride) {
      return realFetch(url, request);
    }
    const mockResponse = matchingOverride.handler(request);
    return Promise.resolve(mockResponse);
  };
};

type HttpHandlerFactory = (
  url: string,
  handler: (requestInit: RequestInit) => HandlerResponse
) => HttpOverride;

const genericHttpHandler = (method: HttpOverride['method']): HttpHandlerFactory => {
  return (url, handler) => {
    return {
      url,
      handler,
      method,
      __type: 'HTTP',
    };
  };
};

export const httpHandler = {
  get: genericHttpHandler('GET'),
  post: genericHttpHandler('POST'),
  put: genericHttpHandler('PUT'),
  delete: genericHttpHandler('DELETE'),
  options: genericHttpHandler('OPTIONS'),
  patch: genericHttpHandler('PATCH'),
} as const;

type HandlerResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<JSONValue>;
};

export const httpResponse = {
  ok: (response: JSONValue) =>
    ({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
    } as Response),
};

export const isHttpApiHandler = (handler: HandlerOverride): handler is HttpOverride =>
  handler.__type === 'HTTP';
