import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { Value } from '@devvit/protos/types/google/protobuf/struct.js';

import { DOT_DEVVIT_DIR_FILENAME } from '../lib/config.js';
import { createEventsClient } from './clientGenerators.js';
import { isFile } from './file-util.js';

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

/**
 * Track telemetry event
 * @param event event object
 * @param force boolean, used to track `devvit metrics on`
 */
export async function sendEvent(
  event: Value['structValue'],
  force: boolean = false
): Promise<void> {
  const shouldTrack = force || (await isMetricsEnabled());
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

  // We unfortunately do need to await this, as we want to make sure the event
  // is sent, even if the process is killed immediately after.
  await createEventsClient()
    .SendEvent({ structValue: eventWithSession })
    .catch(() => {}); // But we don't want or need to whine about it failing.
}
