import { errorsScriptFileName } from '@devvit/shared-types/web-view-scripts-constants.js';

import { getWebViewScriptUrl } from './web-view-script-url.js';

export function getErrorsModuleUrl(scriptSrc: string | undefined): string {
  return getWebViewScriptUrl(scriptSrc, errorsScriptFileName);
}

export function initErrorListener(scriptSrc: string): void {
  const errorsModuleUrl = getErrorsModuleUrl(scriptSrc);
  const maxLoadAttempts = 3;
  let loadAttempts = 0;
  let isLoading = false;
  let isLoaded = false;

  const loadErrorsModule = async (): Promise<void> => {
    if (isLoaded || isLoading || loadAttempts >= maxLoadAttempts) return;

    loadAttempts += 1;
    isLoading = true;
    try {
      // Resolve the fixed module filename relative to the bootstrap script at runtime.
      // eslint-disable-next-line no-unsanitized/method
      await import(errorsModuleUrl);
      isLoaded = true;
    } catch (error: unknown) {
      console.error('Failed to load the unhandled errors module', error);
    } finally {
      isLoading = false;
    }
  };

  const onRuntimeError = (): void => {
    // EventTarget does not await listener promises; the loader handles its own rejection.
    void loadErrorsModule();
  };

  addEventListener('error', onRuntimeError);
  addEventListener('unhandledrejection', onRuntimeError);
}
