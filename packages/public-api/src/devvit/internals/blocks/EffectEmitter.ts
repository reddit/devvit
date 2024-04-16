import type { Effect } from '@devvit/protos';

export interface EffectEmitter {
  emitEffect(dedupeKey: string, effect: Effect): void;
}
