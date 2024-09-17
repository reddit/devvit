import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport';
import { defer, mergeMap, Observable } from 'rxjs';

// TODO: figure out why this import is so funky
import pkg from '@improbable-eng/grpc-web';
const { grpc } = pkg;

import type { Rpc } from '@devvit/protos';
import type { StoredToken } from '../lib/auth/StoredToken.js';

import { HEADER_AUTHORIZATION } from '../constants/Headers.js';

export type GrpcWebRPCOptions = {
  baseUrl: string;
  headers: Headers;
  getToken: () => Promise<StoredToken | undefined>;
};

class GRPCMessageFactory implements pkg.grpc.ProtobufMessage {
  static deserializeBinary(bytes: Uint8Array): pkg.grpc.ProtobufMessage {
    return newProtobufMessage(bytes);
  }

  #message: pkg.grpc.ProtobufMessage;
  constructor(bytes: Uint8Array = new Uint8Array()) {
    this.#message = newProtobufMessage(bytes);
  }

  serializeBinary(): Uint8Array {
    return this.#message.serializeBinary();
  }

  toObject(): {} {
    return this.#message.toObject();
  }
}

function newProtobufMessage(bytes: Uint8Array): pkg.grpc.ProtobufMessage {
  return {
    serializeBinary() {
      return bytes;
    },

    toObject() {
      throw Error(
        'gRPC-web ProtobufMessage.toObject() unsupported. This grpc-web ' +
          'client relies on ts-proto to serialize to bytes. This method should ' +
          'never be called.'
      );
    },
  };
}

export class GrpcWebRpc implements Rpc {
  readonly #baseUrl: string;
  readonly #headers: Headers;
  readonly #getToken: () => Promise<StoredToken | undefined>;

  constructor({ baseUrl, headers, getToken }: GrpcWebRPCOptions) {
    this.#baseUrl = baseUrl;
    this.#headers = headers;
    this.#getToken = getToken;
  }

  request(_service: string, _method: string, _data: Uint8Array): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  serverStreamingRequest(
    serviceName: string,
    methodName: string,
    data: Uint8Array
  ): Observable<Uint8Array> {
    const def: pkg.grpc.MethodDefinition<pkg.grpc.ProtobufMessage, pkg.grpc.ProtobufMessage> = {
      methodName,
      service: { serviceName },
      requestStream: false,
      requestType: GRPCMessageFactory,
      responseStream: true,
      responseType: GRPCMessageFactory,
    };
    const observable = defer(() => this.#getToken());

    return observable.pipe(
      mergeMap((token) => {
        return new Observable<Uint8Array>((subscriber) => {
          // convert our headers to grpc metadata and include our auth token
          const metadata = new grpc.Metadata();
          if (token) {
            metadata.set(...HEADER_AUTHORIZATION(token.accessToken));
          }
          this.#headers.forEach((val, key) => metadata.set(key, val));
          const invocation = grpc.invoke(def, {
            request: newProtobufMessage(data),
            host: this.#baseUrl,
            transport: NodeHttpTransport(),
            metadata,
            onMessage(msg) {
              subscriber.next(msg.serializeBinary());
            },
            onEnd(code, msg) {
              if (code === grpc.Code.OK) subscriber.complete();
              else subscriber.error(Error(`gRPC-web code ${code} (${grpc.Code[code]}); ${msg}`));
            },
          });
          return () => invocation.close();
        });
      })
    );
  }

  clientStreamingRequest(
    _service: string,
    _method: string,
    _data: Observable<Uint8Array>
  ): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  bidirectionalStreamingRequest(
    _service: string,
    _method: string,
    _data: Observable<Uint8Array>
  ): Observable<Uint8Array> {
    throw new Error('Method not implemented.');
  }
}
