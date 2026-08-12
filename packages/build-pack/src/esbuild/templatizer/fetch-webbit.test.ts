import { fetchWebbit } from './fetch-webbit.js';

const oldFetch: typeof globalThis.fetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = oldFetch;
});

const baseRsp = {
  headers: {
    get: () => null,
  } as unknown as Headers,
  ok: true,
  status: 200,
  statusText: 'OK',
} as Readonly<Response>;

test('handles successful response with no content', async () => {
  const mockRsp = {
    ...baseRsp,
    headers: {
      get: (name: string): string | null => {
        if (name === 'Content-Length') return '0';
        if (name === 'Content-Type') return 'application/json';
        return null;
      },
    } as Headers,
    text: () => Promise.resolve(''),
  };
  globalThis.fetch = async () => mockRsp;
  expect(await fetchWebbit('/test-endpoint', {}, {})).toBe(undefined);
});

test('returns parsed JSON when response has content', async () => {
  const data = { success: true, data: 'test' };
  const mockRsp = {
    ...baseRsp,
    headers: {
      get: (name: string) => {
        if (name === 'Content-Length') return 50;
        if (name === 'Content-Type') return 'application/json';
        return null;
      },
    } as Headers,
    text: () => Promise.resolve(JSON.stringify(data)),
  };
  globalThis.fetch = async () => mockRsp;

  const result = await fetchWebbit('/test-endpoint', {}, {});
  expect(result).toStrictEqual(data);
});

test('throws error when fetch fails', async () => {
  globalThis.fetch = () => Promise.reject(Error('Network error'));

  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with error: Network error/
  );
});

test('throws error when response is not ok', async () => {
  const mockRsp = {
    ...baseRsp,
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    text: () => Promise.resolve('Internal server failure'),
  };
  globalThis.fetch = async () => mockRsp;

  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with HTTP status 500: Internal Server Error; body: Internal server failure/
  );
});

test('throws error when response is 404', async () => {
  const mockRsp = {
    ...baseRsp,
    ok: false,
    status: 404,
    statusText: 'File Not Found',
    text: () => Promise.resolve('{"status":"error","message":"missing"}'),
  };
  globalThis.fetch = async () => mockRsp;

  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with HTTP status 404: ensure the server handles the `\/test-endpoint` endpoint; body: \{"status":"error","message":"missing"\}/
  );
});

test('includes response body in error message when response is 400', async () => {
  const mockRsp = {
    ...baseRsp,
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    text: () => Promise.resolve('{"status":"error","message":"groupId is required"}'),
  };
  globalThis.fetch = async () => mockRsp;

  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with HTTP status 400: Bad Request; body: \{"status":"error","message":"groupId is required"\}/
  );
});

test('throws error when Content-Type is not application/json', async () => {
  const mockRsp = {
    ...baseRsp,
    headers: {
      get: (name: string) => {
        if (name === 'Content-Length') return '50';
        if (name === 'Content-Type') return 'text/plain';
        return null;
      },
    } as Headers,
    text: () => Promise.resolve('some content'),
  };
  globalThis.fetch = async () => mockRsp;

  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with Content-Type header "text\/plain" but only "application\/json" is supported/
  );
});

test('throws error when Content-Length but no Content-Type header', async () => {
  const mockRsp = {
    ...baseRsp,
    headers: {
      get: (name: string) => {
        if (name === 'Content-Length') return '50';
        return null;
      },
    } as Headers,
    text: () => Promise.resolve('some content'),
  };
  globalThis.fetch = async () => mockRsp;

  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with Content-Type header "null" but only "application\/json" is supported/
  );
});

test('throws error when response text cannot be read', async () => {
  const mockRsp = {
    ...baseRsp,
    headers: {
      get: (name: string) => {
        if (name === 'Content-Length') return 50;
        if (name === 'Content-Type') return 'application/json';
        return null;
      },
    } as Headers,
    text: () => Promise.reject(new Error('Read error')),
  };
  globalThis.fetch = async () => mockRsp;

  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with HTTP status 200: OK; unreadable response body/
  );
});

test('throws error when response is not valid JSON', async () => {
  const mockRsp = {
    ...baseRsp,
    headers: {
      get: (name: string) => {
        if (name === 'Content-Length') return 50;
        if (name === 'Content-Type') return 'application/json';
        return null;
      },
    } as Headers,
    text: () => Promise.resolve('invalid json content'),
  };
  globalThis.fetch = async () => mockRsp;

  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with an unparsable JSON body: invalid json content/
  );
});

test('throws error when response is not a JSON object', async () => {
  const mockRsp = {
    ...baseRsp,
    headers: {
      get: (name: string) => {
        if (name === 'Content-Length') return 50;
        if (name === 'Content-Type') return 'application/json';
        return null;
      },
    } as Headers,
    text: () => Promise.resolve('"string value"'),
  };
  globalThis.fetch = async () => mockRsp;

  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with an unrecognized JSON body instead of an object `{}`: "string value"/
  );
});

test('handles successful response with empty content', async () => {
  const mockRsp = {
    ...baseRsp,
    headers: {
      get: (name: string): string | null => {
        if (name === 'Content-Length') return '0';
        if (name === 'Content-Type') return 'application/json';
        return null;
      },
    } as Headers,
    text: () => Promise.resolve(''),
  };
  globalThis.fetch = async () => mockRsp;

  const result = await fetchWebbit('/test-endpoint', {}, {});
  expect(result).toStrictEqual(undefined);
});

test('throws on response but no Content-Length', async () => {
  const mockRsp = {
    ...baseRsp,
    headers: {
      get: (name: string): string | null => {
        if (name === 'Content-Length') return '0';
        if (name === 'Content-Type') return 'application/json';
        return null;
      },
    } as Headers,
    text: () => Promise.resolve('{"data":"content"}'),
  };
  globalThis.fetch = async () => mockRsp;
  await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
    /Content-Length header "0" but greater than zero required/
  );
});
