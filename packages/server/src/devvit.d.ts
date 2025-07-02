declare global {
  import type { Definition } from '@devvit/protos';

  declare module '@devvit/public-api' {
    export * from '@devvit/public-api';

    // Expose @internal methods.
    export namespace Devvit {
      export function provide(def: Definition): void;
    }
  }
}
