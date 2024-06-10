import path from 'node:path';
import fs from 'node:fs/promises';
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

export async function sendEvent(event: Value['structValue']): Promise<void> {
  if (await isMetricsEnabled()) {
    // Don't await this - we don't want to block the command from running
    createEventsClient()
      .SendEvent(
        Value.fromPartial({
          structValue: event,
        })
      )
      .catch(() => {}); // No-op on errors
  }
}
