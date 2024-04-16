import { TwirpError, TwirpErrorCode } from 'twirp-ts/build/twirp/errors.js';
import type { HeadersInit, BodyInit, RequestInit, Response } from 'node-fetch';
import fetch, { Headers } from 'node-fetch';
import type { StoredToken } from '@devvit/protos';

export enum ContentType {
  Json = 'application/json',
  ProtoBuf = 'application/protobuf',
}

export type Rpc = {
  request(
    service: string,
    method: string,
    contentType: ContentType.Json | ContentType.ProtoBuf,
    data: object | Uint8Array
  ): Promise<object | Uint8Array>;
};

export type FetchRPCOptions = Omit<RequestInit, 'body' | 'method'> & {
  baseUrl: string;
  getToken: () => Promise<StoredToken | undefined>;
};

export const NodeFetchRPC: (options: FetchRPCOptions) => Rpc = (options) => {
  return {
    async request(service, method, contentType, data): Promise<object | Uint8Array> {
      const headers = new Headers(options.headers as HeadersInit);
      headers.set('content-type', contentType);
      if (options.getToken) {
        const token = await options.getToken();
        if (!token) {
          console.error(`Expected token to be present for rpc ${service} ${method}`);
          throw new TwirpError(TwirpErrorCode.Unauthenticated, 'UNAUTHORIZED');
        }

        headers.set('authorization', `bearer ${token.accessToken}`);
      }

      const response = await fetch(`${options.baseUrl}/${service}/${method}`, {
        ...options,
        method: 'POST',
        headers,
        body: data instanceof Uint8Array ? (data as BodyInit) : JSON.stringify(data),
      });

      if (response.status === 200) {
        if (contentType === ContentType.Json) {
          return (await response.json()) as object | Uint8Array;
        }
        return new Uint8Array(await response.arrayBuffer());
      }

      const err = await getErrorFromResponse(response);
      throw TwirpError.fromObject(err);
    },
  };
};

async function getErrorFromResponse(response: Response): Promise<Record<string, unknown>> {
  if (response.headers.get('content-type') === ContentType.Json) {
    return (await response.json()) as Record<string, unknown>;
  }

  const body = await response.text();
  return {
    code: `${response.status} ${response.statusText}: ${body}`,
    msg: `${response.status} ${response.statusText}: ${body}`,
  };
}
