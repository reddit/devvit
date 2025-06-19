import { Devvit } from '../../Devvit.js';

// to-do: ask for a whole service and assign that to the prototype instead. Most
//        usages do not want a partial service implementation and the typing for
//        that is clumsy anyway.
export function extendDevvitPrototype<T, K extends keyof T = keyof T>(key: K, value: T[K]): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (Devvit as Function).prototype[key] = value;
}
