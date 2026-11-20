import type { IncomingMessage, ServerResponse } from 'node:http';

import type { PartialJsonValue } from '@devvit/web/shared';

import {
  Endpoint,
  EndpointMethod,
  type ErrorRsp,
  type OnCronUninstallCleanupRsp,
} from '../shared/api.ts';
import { onCronUninstallCleanup } from './uninstall-cleanup.ts';

type AnyRsp = OnCronUninstallCleanupRsp | ErrorRsp;

/** Handles requests and reports unexpected failures. */
export async function onReq(req: IncomingMessage, rsp: ServerResponse): Promise<void> {
  try {
    await route(req, rsp);
  } catch (err) {
    const msg = `server error; ${err instanceof Error ? err.stack : err}`;
    console.error(msg);
    writeJson<ErrorRsp>(500, { error: msg, status: 500 }, rsp);
  }
}

/** Dispatches supported endpoints. */
async function route(req: IncomingMessage, rsp: ServerResponse): Promise<void> {
  const endpoint = req.url?.slice(1) as Endpoint;
  const method = EndpointMethod[endpoint];

  let json: AnyRsp;
  if (method !== req.method) {
    json = { error: 'not found', status: 404 };
  } else {
    // eslint-disable-next-line sonarjs/no-small-switch -- Allow for expansion.
    switch (endpoint) {
      case Endpoint.OnCronUninstallCleanup:
        json = await onCronUninstallCleanup();
        break;
      default:
        endpoint satisfies never;
        json = { error: 'not found', status: 404 };
        break;
    }
  }
  writeJson<AnyRsp>('status' in json ? json.status : 200, json, rsp);
}

/** Writes a JSON response. */
function writeJson<T extends PartialJsonValue>(
  status: number,
  json: Readonly<T>,
  rsp: ServerResponse
): void {
  const body = JSON.stringify(json);
  rsp.writeHead(status, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/json',
  });
  rsp.end(body);
}
