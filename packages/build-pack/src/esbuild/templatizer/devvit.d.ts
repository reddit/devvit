// eslint-disable-next-line no-restricted-imports
import '@devvit/public-api';

declare module '@devvit/public-api' {
  // Expose privates in the `Devvit` singleton. These signatures must be
  // manually synced.
  namespace Devvit {
    function _initForms(): void;
    function _initMenu(): void;
    function _initScheduler(): void;
    function _initSettings(global: boolean, sub: boolean): void;
  }

  // `UIClient.showWebViewInternal` is `@internal`, so it's stripped from the
  // published types. `UIClient` is a type alias and can't be merged into, so
  // expose it on an intersection instead. This signature must be manually
  // synced.
  type InternalUIClient = UIClient & {
    showWebViewInternal(entrypointName: string, presentation: 'fullscreen' | 'modal'): void;
  };
}
