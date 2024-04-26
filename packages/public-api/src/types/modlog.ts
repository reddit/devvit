import type { ModActionType } from '../index.js';

export type ModLogAddOptions = {
  action: ModActionType;
  details?: string | undefined;
  description?: string | undefined;
  note?: string | undefined;
  target?: string | undefined;
};

/**
 * You must have the `modLog` enabled in `Devvit.configure` to use this client.
 *
 * @example
 * ```ts
 * Devvit.configure({
 *   modLog: true
 * });
 * ```
 */
export type ModLog = {
  /**
   * Adds a record to the Mod log of the current subreddit
   *
   * @example
   * ```ts
   *
   * await context.modLog.add({
   *   action: 'approvecomment',
   *   target: commentId,
   *   note: "Banned for breaking the rules"
   * });
   * ```
   */
  add(options: Readonly<ModLogAddOptions>): Promise<void>;
};
