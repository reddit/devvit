import type { Metadata } from '@devvit/protos/lib/Types.js';
import type { JsonObject, JsonValue, PartialJsonObject } from '@devvit/shared-types/json.js';
import { getServerPort } from '@devvit/shared-types/server/get-server-port.js';

import { abbreviate } from './error-utils.js';

/**
 * Post to endpoint and return user Node.js server response. All responses are
 * expected to be empty or a JSON _object_.
 *
 * @throws Throws on `!Response.ok`.
 * @throws Response body is nonempty and content-type is not JSON.
 * @throws Response body is nonempty and unparsable.
 * @throws Response body is nonempty and not a JSON object.
 * @internal
 */
export async function fetchWebbit(
  endpoint: string,
  body: Readonly<PartialJsonObject>,
  meta: Readonly<Metadata>
): Promise<JsonObject | undefined> {
  const url = new URL(endpoint, `http://webbit.local:${getServerPort()}/`);

  const headers: { [k: string]: string } = {};
  for (const [k, v] of Object.entries(meta)) headers[k] = v.values.join();
  headers['Content-Type'] = 'application/json';
  headers['Accept'] = 'application/json';

  const preamble = `Failed to POST to Node.js server endpoint ${endpoint}; server responded with`;

  let rsp;
  try {
    rsp = await fetch(url, {
      body: JSON.stringify(body),
      headers,
      method: 'POST',
      // to-do: redirect: 'manual'?
    });
  } catch (err) {
    throw `${preamble} error: ${err instanceof Error ? err.message : err}`;
  }

  let text: string;
  try {
    text = await rsp.text();
  } catch {
    throw Error(
      `${preamble} HTTP status ${rsp.status}: ${rsp.statusText}; unreadable response body`
    );
  }

  const bodySuffix = text ? `; body: ${abbreviate(text)}` : '';

  if (rsp.status === 404)
    throw Error(
      `${preamble} HTTP status ${rsp.status}: ensure the server handles the \`${endpoint}\` endpoint${bodySuffix}`
    );

  if (!rsp.ok) throw Error(`${preamble} HTTP status ${rsp.status}: ${rsp.statusText}${bodySuffix}`);

  if (!text) return;

  const contentLen = rsp.headers.get('Content-Length');
  if (!Number(contentLen))
    throw Error(
      `${preamble} Content-Length header "${contentLen}" but greater than zero required for nonempty response`
    );

  const contentType = rsp.headers.get('Content-Type');
  if (!contentType || !contentType.includes('application/json')) {
    throw Error(
      `${preamble} Content-Type header "${contentType}" but only "application/json" is supported`
    );
  }

  let json: JsonValue;
  try {
    json = JSON.parse(text);
  } catch {
    throw Error(`${preamble} an unparsable JSON body: ${abbreviate(text)}`);
  }

  if (!json || typeof json !== 'object' || Array.isArray(json))
    throw Error(
      `${preamble} an unrecognized JSON body instead of an object \`{}\`: ${abbreviate(text)}`
    );

  return json;
}
