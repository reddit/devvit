declare global {
  declare module '@devvit/public-api' {
    export * from '@devvit/public-api';

    // Extend the Devvit namespace with the payments related props and methods
    // on Devvit that are marked @internal.
    export namespace Devvit {
      export function provide(def: protos.Definition): void;

      export function use<T>(def: protos.Definition): T;
    }
  }
}
