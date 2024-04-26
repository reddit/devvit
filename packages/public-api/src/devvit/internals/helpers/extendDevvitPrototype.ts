import { Devvit } from '../../Devvit.js';

export function extendDevvitPrototype(key: string, value: unknown): void {
  (Devvit as Function).prototype[key] = value;
}
