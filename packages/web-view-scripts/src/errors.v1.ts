import {
  BrowserClient,
  defaultStackParser,
  type ErrorEvent as SentryErrorEvent,
  type EventHint,
  type Exception,
  exceptionFromError,
  makeFetchTransport,
  Scope,
} from '@sentry/browser';

const sentryKey = 'ff215671c03739e27b47341a0502c369'; // Public client key for devvit/devvit-app.
const errorTrackingHost = 'error-tracking.reddit.com';
const envelopeUrl = `https://${errorTrackingHost}/devvit/api/devvit-app/envelope/?sentry_key=${sentryKey}&sentry_version=7`;
const maxErrorMessageLength = 1_000;
const sampleRate = 1_000;

const client = new BrowserClient({
  // The SDK requires a numeric project ID. The transport uses the actual project slug.
  dsn: `https://${sentryKey}@${errorTrackingHost}/devvit/1`,
  // disables Sentry's automatic error handlers, breadcrumbs and other optional instrumentation; our listener already selects the error to report.
  integrations: [],
  // disables Sentry's internal dropped-event reports, to avoid extra reporting traffic
  sendClientReports: false,
  sampleRate: 1 / sampleRate,
  stackParser: defaultStackParser,
  beforeSend: sanitizeEvent,
  transport: (options) => makeFetchTransport({ ...options, url: envelopeUrl }),
  transportOptions: {
    fetchOptions: { credentials: 'omit', referrerPolicy: 'no-referrer' },
    headers: { 'Content-Type': 'application/x-sentry-envelope' },
  },
});
const scope = new Scope();
scope.setClient(client);
client.init();

export class ErrorReporter {
  report(event: ErrorEvent | PromiseRejectionEvent): void {
    const { appSlug, appVersion } = globalThis.devvit?.context ?? {};

    scope.captureEvent({
      timestamp: (performance.timeOrigin + event.timeStamp) / 1000,
      level: 'error',
      environment: 'production',
      ...(appSlug && appVersion ? { release: `${appSlug}@${appVersion}` } : {}),
      tags: {
        ...(appSlug ? { 'devvit.app_slug': appSlug } : {}),
        ...(appVersion ? { 'devvit.app_version': appVersion } : {}),
        'devvit.surface': 'webview',
      },
      exception: { values: [toException(event)] },
    });
  }
}

function toException(event: ErrorEvent | PromiseRejectionEvent): Exception {
  const errorEvent = event instanceof ErrorEvent;
  const reason: unknown = errorEvent ? event.error : event.reason;
  const exception: Exception =
    reason instanceof Error || reason instanceof DOMException
      ? exceptionFromError(defaultStackParser, reason)
      : {
          type: errorEvent ? 'Error' : 'UnhandledRejection',
          value: errorEvent
            ? event.message || 'Uncaught web view error: no error message was provided'
            : `Promise rejected with a non-Error value: (${reason === null ? 'null' : typeof reason})`,
        };
  exception.mechanism = { handled: false, type: errorEvent ? 'onerror' : 'onunhandledrejection' };
  if (!exception.stacktrace && errorEvent && event.filename) {
    exception.stacktrace = {
      frames: [{ filename: event.filename, lineno: event.lineno, colno: event.colno }],
    };
  }
  return exception;
}

function sanitizeEvent(event: SentryErrorEvent, hint: EventHint): SentryErrorEvent {
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = exception.value.slice(0, maxErrorMessageLength);
    // Scrub after event processors so their stack URLs are sanitized too.
    for (const frame of exception.stacktrace?.frames ?? []) {
      if (frame.filename) {
        frame.filename = frame.filename.startsWith('data:')
          ? 'data:'
          : frame.filename.replace(/[?#].*/s, '');
      }
    }
  }

  // Remove attachments and app-added Sentry metadata from this report.
  hint.attachments = [];
  const appSlug = event.tags?.['devvit.app_slug'];
  const appVersion = event.tags?.['devvit.app_version'];
  return {
    type: undefined,
    ...(event.event_id !== undefined ? { event_id: event.event_id } : {}),
    ...(event.timestamp !== undefined ? { timestamp: event.timestamp } : {}),
    ...(event.level !== undefined ? { level: event.level } : {}),
    ...(event.platform !== undefined ? { platform: event.platform } : {}),
    ...(event.environment !== undefined ? { environment: event.environment } : {}),
    ...(typeof appSlug === 'string' && typeof appVersion === 'string'
      ? { release: `${appSlug}@${appVersion}` }
      : {}),
    tags: {
      ...(typeof appSlug === 'string' ? { 'devvit.app_slug': appSlug } : {}),
      ...(typeof appVersion === 'string' ? { 'devvit.app_version': appVersion } : {}),
      'devvit.surface': 'webview',
    },
    ...(event.exception !== undefined ? { exception: event.exception } : {}),
  };
}
