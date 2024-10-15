import { Devvit } from '../../Devvit.js';

export function extendDevvitPrototype(key: string, value: unknown): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (Devvit as Function).prototype[key] = value;
}
