// to-do: delete support for untrusted events once known to not impact ranking.
/**
 * Whether `Event.isTrusted` is required to act on events.
 * Only the `enabled` variant requires trusted events.
 *
 * @see https://experiment-config.snooguts.net/experiments/devvit_require_trusted_events
 * @example WebViewClientData JSON received at launch:
 * ```json
 * {
 *   "featureConfig": {
 *     "experiments": {
 *       "devvit_require_trusted_events": "enabled"
 *     }
 *   }
 * }
 * ```
 */
export function requireTrustedEvents(): boolean {
  return globalThis.devvit?.experiments?.devvit_require_trusted_events === 'enabled';
}
