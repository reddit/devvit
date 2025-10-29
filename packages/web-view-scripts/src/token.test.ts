import { describe, expect, test } from 'vitest';

import { decodeToken } from './token.js';

describe('decodeRequestContext()', () => {
  test('decodes valid JWT with devvit claim', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZ2aXQiOnsiYXBwIjp7ImlkIjoiYXBwMTIzIiwibmFtZSI6InRlc3RBcHAiLCJ2ZXJzaW9uIjoiMS4wLjAiLCJzdGF0dXMiOjF9LCJzdWJyZWRkaXQiOnsiaWQiOiJ0NV8xMjMiLCJuYW1lIjoidGVzdFN1YnJlZGRpdCJ9LCJ1c2VyIjp7ImlkIjoidDJfNDU2IiwibmFtZSI6InRlc3RVc2VyIn0sInBvc3QiOnsiaWQiOiJ0M183ODkiLCJhdXRob3IiOiJ0Ml80MDAifX0sImlzcyI6InRlc3QifQ.1EjHuCuOz_-QBFLnDpNO5lE5l3X2VV0hqTwGR7sFz88';

    expect(decodeToken(jwt)).toMatchInlineSnapshot(`
      {
        "app": {
          "id": "app123",
          "name": "testApp",
          "status": 1,
          "version": "1.0.0",
        },
        "post": {
          "author": "t2_400",
          "id": "t3_789",
        },
        "subreddit": {
          "id": "t5_123",
          "name": "testSubreddit",
        },
        "user": {
          "id": "t2_456",
          "name": "testUser",
        },
      }
    `);
  });

  test('returns undefined for empty string', () => {
    expect(decodeToken('')).toBeUndefined();
  });

  test('throws for invalid JWT', () => {
    expect(() => decodeToken('invalid.jwt.token')).toThrowErrorMatchingInlineSnapshot(
      `[Error: token decode failure]`
    );
  });
});
