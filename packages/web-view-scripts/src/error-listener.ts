import { errorsScriptFileName } from '@devvit/shared-types/web-view-scripts-constants.js';

import { getWebViewScriptUrl } from './web-view-script-url.js';

export function getErrorsModuleUrl(scriptSrc: string | undefined): string {
  return getWebViewScriptUrl(scriptSrc, errorsScriptFileName);
}

export function initErrorListener(scriptSrc: string): void {
  const errorsModuleUrl = getErrorsModuleUrl(scriptSrc);
  let errorOccurred = false;

  const onRuntimeError = async (event: ErrorEvent | PromiseRejectionEvent): Promise<void> => {
    if (errorOccurred) return;
    errorOccurred = true;
    try {
      // Resolve the fixed module filename relative to the bootstrap script at runtime.
      // eslint-disable-next-line no-unsanitized/method
      const { ErrorReporter } = await import(errorsModuleUrl);
      new ErrorReporter().report(event);
    } catch {
      // A reporting failure must not trigger another unhandled rejection.
    }
  };

  addEventListener('error', onRuntimeError);
  addEventListener('unhandledrejection', onRuntimeError);
}
