import { expect, vi } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

test('should throw when fetch() is called', async () => {
  await expect(fetch('https://noop.reddit.com')).rejects.toThrow(
    'HTTP requests are not allowed in tests'
  );
});

test('should throw for GET requests', async () => {
  await expect(fetch('https://noop.reddit.com', { method: 'GET' })).rejects.toThrow(
    'HTTP requests are not allowed in tests'
  );
});

test('should throw for POST requests', async () => {
  await expect(
    fetch('https://noop.reddit.com/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'value' }),
    })
  ).rejects.toThrow('HTTP requests are not allowed in tests');
});

test('should throw for any URL', async () => {
  const urls = ['https://noop.reddit.com', 'http://localhost:3000', 'https://noop.reddit.com/api'];

  for (const url of urls) {
    await expect(fetch(url)).rejects.toThrow('HTTP requests are not allowed in tests');
  }
});

test('should mock fetch() with basic response', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      id: 25,
      name: 'pikachu',
      height: 4,
      weight: 60,
      types: [{ type: { name: 'electric' } }],
    }),
  } as Response);

  const response = await fetch('https://noop.reddit.com/api/v2/pokemon/pikachu');
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.name).toBe('pikachu');
  expect(data.types[0].type.name).toBe('electric');
});

test('should mock fetch() error responses', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    text: async () => 'Internal Server Error',
  } as Response);

  const response = await fetch('https://noop.reddit.com/api/v2/pokemon/pikachu');
  expect(response.status).toBe(500);
  expect(response.statusText).toBe('Internal Server Error');

  const text = await response.text();
  expect(text).toBe('Internal Server Error');
});

test('should mock fetch() POST requests', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation((_url, options) => {
    const body = options?.body as string;
    const parsedBody = JSON.parse(body);

    return Promise.resolve({
      ok: true,
      status: 201,
      json: async () => ({ id: 123, ...parsedBody }),
    } as Response);
  });

  const response = await fetch('https://noop.reddit.com/api/v2/pokemon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'pikachu', type: 'electric' }),
  });

  const data = await response.json();
  expect(response.status).toBe(201);
  expect(data.name).toBe('pikachu');
  expect(data.type).toBe('electric');
  expect(data.id).toBe(123);
});
