import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { DOT_DEVVIT_DIR_FILENAME } from '../lib/config.js';
import { isFile } from './file-util.js';
import { createEventsClient } from './clientGenerators.js';
import { Value } from '@devvit/protos';

export async function isMetricsEnabled(): Promise<boolean> {
  if (process.env.DEVVIT_DISABLE_METRICS) {
    return false;
  }

  const optOutFile = getMetricsOptOutFile();
  return !(await isFile(optOutFile));
}

export async function optOutMetrics(): Promise<void> {
  const optOutFile = getMetricsOptOutFile();
  const file = await fs.open(optOutFile, 'w');
  await file.close();
}

export async function optInMetrics(): Promise<void> {
  const optOutFile = getMetricsOptOutFile();
  if (await isFile(optOutFile)) {
    await fs.unlink(optOutFile);
  }
}

export function getMetricsOptOutFile(): string {
  return path.join(DOT_DEVVIT_DIR_FILENAME, 'opt-out-metrics');
}

export function getTelemetrySessionIdFilename(): string {
  return path.join(DOT_DEVVIT_DIR_FILENAME, 'session-id');
}

export async function getTelemetrySessionId(): Promise<string> {
  const sessionIdFilename = getTelemetrySessionIdFilename();
  const isSessionIdFileCreated = await isFile(sessionIdFilename);

  if (isSessionIdFileCreated) {
    return await fs.readFile(sessionIdFilename, 'utf-8');
  }

  const sessionId = crypto.randomUUID();
  await fs.writeFile(sessionIdFilename, sessionId, 'utf-8');
  return sessionId;
}

export async function sendEvent(event: Value['structValue']): Promise<void> {
  const shouldTrack = await isMetricsEnabled();
  if (!shouldTrack) {
    return;
  }

  const sessionId = await getTelemetrySessionId();
  const eventWithSession = {
    ...event,
    session: {
      ...event?.session,
      id: sessionId,
    },
  };

  // Don't await this - we don't want to block the command from running
  createEventsClient()
    .SendEvent(Value.fromPartial({ structValue: eventWithSession }))
    .catch(() => {});
}
