import { randomBytes } from 'crypto';

export function generateTraceParent(clientName: string): string | undefined {
  if (!process.env.DEVVIT_FORCE_TRACE) {
    return undefined;
  }

  const traceId = randomBytes(16).toString('hex');
  const spanId = randomBytes(8).toString('hex');
  const flags = '01'; // sampled
  const version = '00';

  console.error(`Trace ID [${clientName}]: ${traceId}`);

  return `${version}-${traceId}-${spanId}-${flags}`;
}
