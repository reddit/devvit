import { randomBytes } from 'crypto';

export function generateTraceParent(): string | undefined {
  if (!process.env.DEVVIT_FORCE_TRACE) {
    return undefined;
  }

  const traceId = randomBytes(16).toString('hex');
  const spanId = randomBytes(8).toString('hex');
  const flags = '01'; // sampled
  const version = '00';

  console.log(`Trace ID: ${traceId}`);

  return `${version}-${traceId}-${spanId}-${flags}`;
}
