import * as fs from 'fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as fileUtil from '../../util/file-util.js';
import { AuthTokenStore } from './AuthTokenStore.js';
import { StoredToken } from './StoredToken.js';

vi.mock('../../util/file-util');
vi.mock('fs/promises');

/*
  Mock token:
  {
    "refreshToken": "testRefreshToken", 
    "accessToken": "testAccessToken",
    "expiresAt": 1751912411169,
    "scope": "developer",
    "tokenType": "bearer"
  }
*/
const mockBase64Token =
  'ewoicmVmcmVzaFRva2VuIjogInRlc3RSZWZyZXNoVG9rZW4iLCAKICJhY2Nlc3NUb2tlbiI6ICJ0ZXN0QWNjZXNzVG9rZW4iLAogImV4cGlyZXNBdCI6MTc1MTkxMjQxMTE2OSwKICJzY29wZSI6ICJkZXZlbG9wZXIiLAogInRva2VuVHlwZSI6ICJiZWFyZXIiCn0=';

describe('AuthTokenStore', () => {
  let authTokenStore: AuthTokenStore;

  beforeEach(() => {
    authTokenStore = new AuthTokenStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('readFSToken', () => {
    it('should return a valid TokenInfo object when the token is stored in process.env.DEVVIT_AUTH_TOKEN', async () => {
      const mockToken = StoredToken.fromBase64(mockBase64Token);
      const mockRawToken = JSON.stringify({ token: mockBase64Token, copyPaste: true });

      process.env.DEVVIT_AUTH_TOKEN = mockRawToken;

      const result = await authTokenStore.readFSToken();

      expect(result).toEqual({ token: mockToken, copyPaste: true });
      delete process.env.DEVVIT_AUTH_TOKEN;
    });

    it('should return undefined if process.env.DEVVIT_AUTH_TOKEN contains invalid JSON', async () => {
      process.env.DEVVIT_AUTH_TOKEN = 'invalid-json';

      const result = await authTokenStore.readFSToken();

      expect(result).toBeUndefined();
      delete process.env.DEVVIT_AUTH_TOKEN;
    });

    it('should return undefined if process.env.DEVVIT_AUTH_TOKEN contains an invalid base64 token', async () => {
      process.env.DEVVIT_AUTH_TOKEN = 'invalid-base64-token';

      const result = await authTokenStore.readFSToken();

      expect(result).toBeUndefined();
      delete process.env.DEVVIT_AUTH_TOKEN;
    });

    it('should return undefined if the token file does not exist', async () => {
      vi.spyOn(fileUtil, 'isFile').mockResolvedValue(false);

      const result = await authTokenStore.readFSToken();

      expect(result).toBeUndefined();
    });

    it('should return undefined if the token file is empty', async () => {
      vi.spyOn(fileUtil, 'isFile').mockResolvedValue(true);
      vi.spyOn(fs, 'readFile').mockResolvedValue('');

      const result = await authTokenStore.readFSToken();

      expect(result).toBeUndefined();
    });

    it('should return a valid TokenInfo object for a valid token', async () => {
      const mockToken = StoredToken.fromBase64(mockBase64Token);
      const mockRawToken = JSON.stringify({ token: mockBase64Token, copyPaste: true });

      vi.spyOn(fileUtil, 'isFile').mockResolvedValue(true);
      vi.spyOn(fs, 'readFile').mockResolvedValue(mockRawToken);

      const result = await authTokenStore.readFSToken();

      expect(result).toEqual({ token: mockToken, copyPaste: true });
    });

    it('should handle old-style tokens and return a valid TokenInfo object', async () => {
      const mockToken = StoredToken.fromBase64(mockBase64Token);

      vi.spyOn(fileUtil, 'isFile').mockResolvedValue(true);
      vi.spyOn(fs, 'readFile').mockResolvedValue(mockBase64Token);

      const result = await authTokenStore.readFSToken();

      expect(result).toEqual({ token: mockToken, copyPaste: false });
    });

    it('should return undefined for invalid JSON tokens', async () => {
      vi.spyOn(fileUtil, 'isFile').mockResolvedValue(true);
      vi.spyOn(fs, 'readFile').mockResolvedValue('invalid-json');

      const result = await authTokenStore.readFSToken();

      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid base64 tokens', async () => {
      vi.spyOn(fileUtil, 'isFile').mockResolvedValue(true);
      vi.spyOn(fs, 'readFile').mockResolvedValue('invalid-base64-token');

      const result = await authTokenStore.readFSToken();

      expect(result).toBeUndefined();
    });
  });
});
