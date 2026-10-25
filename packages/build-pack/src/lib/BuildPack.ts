import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

import type { CompileLog } from '../esbuild/ESBuildPack.js';

/** Project root directory (eg, . or src for single file projects). */
export type ProjectRootDir = string;

export function formatLogs(logs: readonly Readonly<CompileLog>[]): string {
  return logs.map(formatLog).join('\n');
}

export function formatLog(log: Readonly<CompileLog>): string {
  if (log.detail == null) return log.text;
  return [
    `${log.text}; line ${log.detail.line}, column ${log.detail.column} in file ${log.detail.filename}:`,
    log.detail.text,
    log.detail.suggestion,
  ].join('\n');
}

/** Returns a unique temporary filename for an app's generated Blocks shim. */
export function getModuleEntrypoint(): string {
  return path.join(
    os.tmpdir(),
    `blocks-shim-${new Date().toISOString().replaceAll(':', '-')}-${crypto.randomBytes(6).toString('hex')}.tsx`
  );
}
