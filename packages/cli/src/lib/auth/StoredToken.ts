import { isObject } from '@devvit/shared-types/isObject.js';
import type { JSONValue } from '@devvit/shared-types/json.js';
import type { R2OAuthGrant } from '../http/oauth.js';

const TOKEN_FRESHNESS_BUFFER: number = 120_000; // 2 minutes

/**
 * JSON representation of a StoredToken (class). This base64-encodeded on disk.
 */
type StoredTokenJSON = {
  readonly refreshToken: string;
  readonly accessToken: string;
  /**
   * This field differs from R2OAuthGrant in name and time unit (millis here).
   */
  readonly expiresAt: number;
  readonly scope: string;
  readonly tokenType: string;
};

export class StoredToken {
  /** Grant must be recent for the expiration to be accurate. */
  static fromGrant(grant: R2OAuthGrant): StoredToken {
    return new StoredToken({
      accessToken: grant.access_token,
      refreshToken: grant.refresh_token,
      expiresAt: Date.now() + grant.expires_in * 1000,
      scope: grant.scope,
      tokenType: grant.token_type,
    });
  }

  /** Unpack base64 stringified JSON. */
  static fromBase64(base64: string): StoredToken | undefined {
    let token;
    try {
      token = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    } catch {
      return undefined;
    }

    if (!isStoredTokenJSON(token)) {
      return undefined;
    }

    return this.fromJSON(token);
  }

  static fromJSON(token: StoredTokenJSON): StoredToken {
    return new StoredToken(token);
  }

  readonly refreshToken: string;
  readonly accessToken: string;
  readonly expiresAt: Date;
  readonly scope: string;
  readonly tokenType: string;

  constructor(token: StoredTokenJSON) {
    this.refreshToken = token.refreshToken;
    this.accessToken = token.accessToken;
    this.expiresAt = new Date(token.expiresAt);
    this.scope = token.scope;
    this.tokenType = token.tokenType;
  }

  hasScopes(scopes: string): boolean {
    const allowed = new Set(this.scope.split(':'));
    return scopes.split(':').every((scope) => allowed.has(scope));
  }

  isFresh(): boolean {
    // to-do: do we need TOKEN_FRESHNESS_BUFFER? It may be coupled to setTimeout()
    // logic in NodeFSAuthenticationPlugin?
    return Date.now() + TOKEN_FRESHNESS_BUFFER <= this.expiresAt.getTime();
  }

  toJSON(): StoredTokenJSON {
    return {
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      expiresAt: this.expiresAt.getTime(),
      scope: this.scope,
      tokenType: this.tokenType,
    };
  }
}

function isStoredTokenJSON(json: JSONValue): json is StoredTokenJSON {
  return (
    isObject(json) &&
    typeof json.accessToken === 'string' &&
    typeof json.expiresAt === 'number' &&
    typeof json.refreshToken === 'string' &&
    typeof json.scope === 'string' &&
    json.tokenType === 'bearer'
  );
}
