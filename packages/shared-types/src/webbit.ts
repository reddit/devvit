/**
 * Signed Webbit user JWT (header, payload, signature base64 strings separated
 * by dots). Users shouldn't share their JWTs with others, but perfectly fine
 * for a given user to see.
 *
 * `BridgeContext.token` encodes a `RequestContext` and
 * `BridgeContext.webbitToken` encodes a `WebbitClaims`.
 */
export type WebbitToken = `${string}.${string}.${string}`;
export const noWebbitToken: WebbitToken = `0.0.0`;

/**
 * `RequestContext` token query parameter name on `DevvitPost.entrypointUrl`.
 */
export const tokenParam: string = 'token';
