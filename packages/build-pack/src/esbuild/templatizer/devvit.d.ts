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
}
