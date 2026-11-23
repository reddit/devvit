// @vitest-environment jsdom

import { devvitScriptUrl } from '@devvit/shared-types/web-view-scripts-constants.js';
import { type Event as SentryEvent, getGlobalScope } from '@sentry/browser';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { initErrorListener } from './error-listener.js';
import { ErrorReporter } from './errors.v1.js';

vi.mock('https://webview.devvit.net/scripts/errors.v1.min.js', () => import('./errors.v1.js'));
vi.mock('https://webview-dev.devvit.net/scripts/errors.v1.min.js', () => {
  throw new Error('Reporter failed to load');
});

// The module selects fetch on import; install a stable mock before that initialization.
const browserFetch = vi.hoisted(() => {
  const fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
});

beforeEach(() => {
  browserFetch.mockReset().mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal('fetch', browserFetch);
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('uses Sentry fetch selection to report one sampled error per view and convert rejection reasons', async () => {
  const target = new EventTarget();
  vi.stubGlobal('addEventListener', target.addEventListener.bind(target));
  vi.stubGlobal('fetch', browserFetch);
  vi.stubGlobal('devvit', { context: { appSlug: 'error-tester', appVersion: '1.2.3' } });
  vi.spyOn(getGlobalScope(), 'getScopeData').mockReturnValue({
    ...getGlobalScope().getScopeData(),
    user: { id: 'app-user-id' },
    tags: { 'app-private-tag': 'app-private-value' },
    extra: { 'app-private-extra': 'app-private-value' },
    attachments: [{ filename: 'app-private-file.txt', data: 'app-private-attachment' }],
    eventProcessors: [
      (event) => {
        const frame = event.exception?.values?.[0]?.stacktrace?.frames?.[0];
        if (frame?.filename) frame.filename += '?processor-private=value';
        return event;
      },
    ],
  });

  const bootstrapFetch = vi.fn<typeof fetch>();
  vi.stubGlobal('fetch', bootstrapFetch);
  initErrorListener(devvitScriptUrl);
  vi.stubGlobal('fetch', browserFetch);
  expect(browserFetch).not.toHaveBeenCalled();

  const error = new TypeError('First failure');
  error.stack = `${error}\n    at start (https://app.example/game.js?private=value#bridge:5:10)`;
  target.dispatchEvent(new ErrorEvent('error', { error }));
  target.dispatchEvent(
    Object.assign(new Event('unhandledrejection'), { reason: new Error('Rejected during load') })
  );

  await vi.waitFor(() => expect(browserFetch).toHaveBeenCalledTimes(1));
  target.dispatchEvent(
    Object.assign(new Event('unhandledrejection'), { reason: { user: 'arbitrary payload' } })
  );
  await Promise.resolve();
  expect(browserFetch).toHaveBeenCalledTimes(1);

  const rejectedEvent = (reason: unknown): PromiseRejectionEvent =>
    Object.assign(new Event('unhandledrejection'), {
      promise: Promise.resolve(),
      reason,
    }) as PromiseRejectionEvent;

  const reporter = new ErrorReporter();
  reporter.report(rejectedEvent(new Error('Rejected directly')));
  reporter.report(rejectedEvent({ user: 'arbitrary payload' }));
  await vi.waitFor(() => expect(browserFetch).toHaveBeenCalledTimes(3));

  const [url, request] = browserFetch.mock.calls[0]!;
  expect(String(url)).toMatch(
    /^https:\/\/error-tracking\.reddit\.com\/devvit\/api\/devvit-app\/envelope\/\?sentry_key=\w+&sentry_version=7$/
  );
  expect(request).toMatchObject({
    method: 'POST',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    headers: { 'Content-Type': 'application/x-sentry-envelope' },
  });
  const events = browserFetch.mock.calls.map(([, init]) => {
    const [header, item, payload] = String(init?.body).split('\n');
    expect(JSON.parse(item!)).toMatchObject({ type: 'event' });
    const event: SentryEvent = JSON.parse(payload!);
    expect(JSON.parse(header!).event_id).toBe(event.event_id);
    return event;
  });
  expect(events[0]).toMatchObject({
    platform: 'javascript',
    level: 'error',
    release: 'error-tester@1.2.3',
    tags: {
      'devvit.app_slug': 'error-tester',
      'devvit.app_version': '1.2.3',
      'devvit.surface': 'webview',
    },
    exception: {
      values: [
        {
          type: 'TypeError',
          value: 'First failure',
          mechanism: { type: 'onerror', handled: false },
          stacktrace: {
            frames: [{ filename: 'https://app.example/game.js', lineno: 5, colno: 10 }],
          },
        },
      ],
    },
  });
  expect(events[0]?.user).toBeUndefined();
  expect(events[0]?.tags).not.toHaveProperty('app-private-tag');
  expect(events[0]?.extra).toBeUndefined();
  expect(events[0]?.event_id).toMatch(/^[a-f0-9]{32}$/);
  expect(String(request?.body)).not.toContain('app-private-attachment');
  expect(String(request?.body)).not.toContain('processor-private');
  expect(events[1]?.exception?.values?.[0]).toMatchObject({
    value: 'Rejected directly',
    mechanism: { type: 'onunhandledrejection', handled: false },
  });
  expect(events[2]?.exception?.values?.[0]).toMatchObject({
    value: 'Promise rejected with a non-Error value: (object)',
  });
  expect(browserFetch.mock.calls[2]?.[1]?.body).not.toContain('arbitrary payload');
  expect(bootstrapFetch).not.toHaveBeenCalled();
});

it('honors Sentry event processors that filter reports before beforeSend', async () => {
  const filterEvent = vi.fn(() => null);
  vi.spyOn(getGlobalScope(), 'getScopeData').mockReturnValue({
    ...getGlobalScope().getScopeData(),
    eventProcessors: [filterEvent],
  });

  const reporter = new ErrorReporter();
  reporter.report(new ErrorEvent('error', { error: new Error('Filtered failure') }));

  await vi.waitFor(() => expect(filterEvent).toHaveBeenCalledOnce());
  expect(browserFetch).not.toHaveBeenCalled();
});

it.each([
  { random: 0, sampled: true },
  { random: 0.00009999, sampled: true },
  { random: 0.0001, sampled: true },
  { random: 0.00010001, sampled: false },
  { random: 0.1, sampled: false },
  { random: 0.99, sampled: false },
])(
  'uses Sentry sampling for the first runtime error when Math.random returns $random',
  async ({ random, sampled }) => {
    const target = new EventTarget();
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(random);
    vi.stubGlobal('addEventListener', target.addEventListener.bind(target));
    vi.stubGlobal('fetch', browserFetch);

    initErrorListener(devvitScriptUrl);
    expect(randomSpy).not.toHaveBeenCalled();
    target.dispatchEvent(new ErrorEvent('error', { error: new Error('First failure') }));
    await vi.dynamicImportSettled();
    expect(browserFetch).toHaveBeenCalledTimes(sampled ? 1 : 0);

    randomSpy.mockClear().mockReturnValue(0);
    target.dispatchEvent(new ErrorEvent('error', { error: new Error('Later failure') }));
    await vi.dynamicImportSettled();
    expect(browserFetch).toHaveBeenCalledTimes(sampled ? 1 : 0);
    expect(randomSpy).not.toHaveBeenCalled();
  }
);

it('contains reporter import failures', async () => {
  const target = new EventTarget();
  vi.stubGlobal('addEventListener', target.addEventListener.bind(target));
  vi.stubGlobal('fetch', browserFetch);

  initErrorListener('https://webview-dev.devvit.net/scripts/devvit.v1.min.js');
  target.dispatchEvent(new ErrorEvent('error', { error: new Error('First failure') }));
  await vi.dynamicImportSettled();
  target.dispatchEvent(new ErrorEvent('error', { error: new Error('Later failure') }));
  await vi.dynamicImportSettled();

  expect(browserFetch).not.toHaveBeenCalled();
});

it.each([
  { reason: 'private payload', type: 'string' },
  { reason: 42, type: 'number' },
  { reason: false, type: 'boolean' },
  { reason: null, type: 'null' },
  { reason: undefined, type: 'undefined' },
  { reason: { user: 'private payload' }, type: 'object' },
])('reports the type of a non-Error rejection ($type) without its payload', ({ reason, type }) => {
  const reporter = new ErrorReporter();
  reporter.report(
    Object.assign(new Event('unhandledrejection'), { reason }) as PromiseRejectionEvent
  );

  const body = String(browserFetch.mock.calls[0]?.[1]?.body);
  const event: SentryEvent = JSON.parse(body.split('\n')[2]!);
  expect(event.exception?.values?.[0]).toMatchObject({
    type: 'UnhandledRejection',
    value: `Promise rejected with a non-Error value: (${type})`,
    mechanism: { type: 'onunhandledrejection', handled: false },
  });
  expect(body).not.toContain('private payload');
});

it('limits long error messages and redacts fallback stack URLs', () => {
  const reporter = new ErrorReporter();
  reporter.report(
    new ErrorEvent('error', {
      message: 'x'.repeat(1_001),
      filename: 'data:text/javascript,private payload',
      lineno: 7,
      colno: 9,
    })
  );

  const body = String(browserFetch.mock.calls[0]?.[1]?.body);
  const event: SentryEvent = JSON.parse(body.split('\n')[2]!);
  expect(event.exception?.values?.[0]).toMatchObject({
    value: 'x'.repeat(1_000),
    stacktrace: { frames: [{ filename: 'data:', lineno: 7, colno: 9 }] },
  });
  expect(body).not.toContain('private payload');
});
