import { userProgressStateHeader } from '@devvit/shared-types/user-progress.js';

import { initUserProgress } from './user-progress.js';

const origin = 'https://test-app-webview.devvit.net';
const postMessage = vi.fn();
const originalFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('location', { origin, href: `${origin}/index.html` });
  vi.stubGlobal('parent', { postMessage });
  vi.stubGlobal('fetch', originalFetch);
});
afterEach(() => vi.unstubAllGlobals());

it.each([
  { value: 'STARTED', state: 1 },
  { value: 'COMPLETED', state: 2 },
])('delivers $value once without consuming the app response', async ({ value, state }) => {
  const response = new Response('unchanged app response', {
    status: 207,
    headers: { [userProgressStateHeader]: value },
  });
  originalFetch.mockResolvedValue(response);
  initUserProgress();

  const result = await fetch('/api/trpc/verifyWords');
  expect(result).toBe(response);
  expect(await result.text()).toBe('unchanged app response');
  expect(postMessage).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ type: 'devvit-internal', userProgress: { state } }),
    '*'
  );
});

it('preserves the request body, headers, and abort signal for the existing fetch wrapper', async () => {
  const input = new Request(`${origin}/api/trpc/verifyWords`, {
    method: 'POST',
    body: 'game data',
  });
  originalFetch.mockResolvedValue(
    new Response('', { headers: { [userProgressStateHeader]: 'STARTED' } })
  );
  const init = { signal: new AbortController().signal, headers: { 'x-app-header': 'value' } };
  initUserProgress();
  await fetch(input, init);
  expect(originalFetch).toHaveBeenCalledExactlyOnceWith(input, init);
  expect(postMessage).toHaveBeenCalledOnce();
});

it.each([
  { url: 'https://example.com/api/verify', redirected: false },
  { url: `${origin}/static.json`, redirected: false },
  { url: `${origin}/api/verify`, redirected: true },
])('ignores unrelated or redirected responses ($url, $redirected)', async ({ url, redirected }) => {
  const response = new Response('', { headers: { [userProgressStateHeader]: 'COMPLETED' } });
  Object.defineProperty(response, 'redirected', { value: redirected });
  originalFetch.mockResolvedValue(response);
  initUserProgress();
  await fetch(url);
  expect(postMessage).not.toHaveBeenCalled();
});

it.each([undefined, 'UNKNOWN'])(
  'does not emit without a supported progress header (%s)',
  async (state) => {
    originalFetch.mockResolvedValue(
      new Response(JSON.stringify({ shouldNotifyClient: true }), {
        headers: state ? { [userProgressStateHeader]: state } : {},
      })
    );
    initUserProgress();
    await fetch('/api/telemetry/journey/progress');
    expect(postMessage).not.toHaveBeenCalled();
  }
);

it('preserves network failures', async () => {
  const error = new Error('network failed');
  originalFetch.mockRejectedValue(error);
  initUserProgress();
  await expect(fetch('/api/verify')).rejects.toBe(error);
  expect(postMessage).not.toHaveBeenCalled();
});

it('preserves a successful response if effect delivery fails', async () => {
  const response = new Response('', { headers: { [userProgressStateHeader]: 'STARTED' } });
  originalFetch.mockResolvedValue(response);
  const error = new Error('host unavailable');
  postMessage.mockImplementation(() => {
    throw error;
  });
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    initUserProgress();
    await expect(fetch('/api/verify')).resolves.toBe(response);
  } finally {
    log.mockRestore();
  }
});

it('initializes through the client entry point and avoids duplicate wrappers across SDK copies', async () => {
  originalFetch.mockResolvedValue(
    new Response('', { headers: { [userProgressStateHeader]: 'STARTED' } })
  );
  vi.stubGlobal('addEventListener', vi.fn());
  vi.resetModules();
  await import('../index.js');
  vi.resetModules();
  const secondCopy = await import('./user-progress.js');
  secondCopy.initUserProgress();
  await fetch('/api/verify');
  expect(originalFetch).toHaveBeenCalledOnce();
  expect(postMessage).toHaveBeenCalledOnce();
});
