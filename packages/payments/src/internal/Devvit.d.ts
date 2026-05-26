// We need Devvit.provide() in paymentHandler.ts 's addPaymentHandler(); forcibly add the typing
// here.
declare global {
  declare module '@devvit/public-api' {
    // eslint-disable-next-line no-restricted-imports
    export * from '@devvit/public-api';

    // Extend the Devvit namespace with the payments related props and methods
    // on Devvit that are marked @internal.
    export namespace Devvit {
      export function provide(def: protos.Definition): void;
    }
  }
}
