import { spawnSync } from 'node:child_process';

import { execaCommand } from 'execa';

/**
 * Cross-platform process-tree termination for `execa` subprocesses started
 * with `shell: true` (and on POSIX, with `detached: true`).
 *
 * We need this because `execa` and the underlying Node `child_process` API
 * only signal the direct child. Under `shell: true` that child is `/bin/sh
 * -c <cmd>` (or `cmd.exe`); the actual dev tooling - vite, esbuild, etc. -
 * runs as descendants and would survive a plain `subprocess.kill()`. There
 * is a long-standing request for execa to expose this directly
 * (https://github.com/sindresorhus/execa/issues/96) but it has not landed,
 * so callers are expected to do it themselves.
 *
 * Strategy:
 * - POSIX: spawn the subprocess with `detached: true` to put it in its own
 *   process group, then signal the group with `process.kill(-pid, signal)`.
 * - Windows: there is no POSIX-style process group; rely on
 *   `taskkill /T /F` to walk and terminate the tree.
 */

/** Subset of execa's subprocess type we actually use. */
type ExecaSubprocess = ReturnType<typeof execaCommand>;

/**
 * Synchronously deliver an initial "stop" signal to the process tree:
 * SIGTERM to the POSIX process group, or `taskkill /T /F` on Windows.
 *
 * Returns as soon as the signal is queued (POSIX) or `taskkill` finishes
 * (Windows). On POSIX it does *not* wait for the tree to actually exit and
 * does *not* escalate to SIGKILL - if you need either, use the async
 * {@link killProcessTree} instead. This sync entry point exists for
 * `process.on('exit', ...)` handlers, which run during event-loop
 * shutdown and can't await.
 */
export function killProcessTreeSync(subprocess: ExecaSubprocess): void {
  const pid = subprocess.pid;
  if (pid == null) return;
  if (process.platform === 'win32') {
    try {
      spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
    } catch {
      // Best-effort: nothing we can do if taskkill is unavailable.
    }
  } else {
    sendKillSignalToGroup(pid, 'SIGTERM');
  }
}

/**
 * Terminate the process tree and wait for it to actually exit. Two things
 * this does that {@link killProcessTreeSync} does not, and the reason this
 * function is async rather than the sync version being awaited:
 *
 * 1. **SIGTERM -> SIGKILL escalation on POSIX.** If the subprocess (or any
 *    descendant) installs a SIGTERM handler that hangs or takes too long,
 *    SIGTERM alone won't kill it. After `gracePeriodMillis` we send
 *    SIGKILL to the process group so Ctrl+C can't leave orphans behind.
 *    Sync callers can't poll-then-escalate because they can't await the
 *    grace period.
 * 2. **`await subprocess`.** Returning from the sync helper only means the
 *    kernel accepted our signal, not that the process is gone. Awaiting
 *    the execa subprocess promise resolves only once the OS reports the
 *    real exit. Callers that immediately respawn a dev script (e.g. on
 *    config reload) need that ordering to avoid racing the dying tree.
 *
 * Use this from normal teardown paths. Use {@link killProcessTreeSync} from
 * `process.on('exit', ...)`, where awaiting is not possible.
 *
 * Errors from awaiting the (now-killed) subprocess are swallowed because
 * a non-zero exit caused by our own signal is expected.
 */
export async function killProcessTree(
  subprocess: ExecaSubprocess,
  options: { gracePeriodMillis: number }
): Promise<void> {
  killProcessTreeSync(subprocess);
  try {
    if (subprocess.pid != null && process.platform !== 'win32') {
      const exited = await awaitExitOrTimeout(subprocess, options.gracePeriodMillis);
      if (!exited) sendKillSignalToGroup(subprocess.pid, 'SIGKILL');
    }
    await subprocess;
  } catch {
    // Expected: awaiting a subprocess we just killed throws.
  }
}

/** Send `signal` to the POSIX process group led by `leaderPid`. */
function sendKillSignalToGroup(leaderPid: number, signal: NodeJS.Signals): void {
  try {
    process.kill(-leaderPid, signal);
  } catch {
    // Already exited or never had a process group; nothing to clean up.
  }
}

/** Resolves to `true` if `subprocess` exits within `timeoutMillis`, else `false`. */
async function awaitExitOrTimeout(
  subprocess: ExecaSubprocess,
  timeoutMillis: number
): Promise<boolean> {
  return await Promise.race([
    subprocess.then(
      () => true,
      () => true
    ),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMillis)),
  ]);
}
