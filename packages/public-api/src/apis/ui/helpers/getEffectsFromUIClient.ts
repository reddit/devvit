import type { Effect } from '@devvit/protos';

import type { UIClient as UIClientType } from '../../../types/ui-client.js';
import type { UIClient } from '../UIClient.js';

/** A simple helper to cast ui into the class instance to get the effects */
export function getEffectsFromUIClient(ui: UIClient | UIClientType): Effect[] {
  return (ui as UIClient).__effects;
}
