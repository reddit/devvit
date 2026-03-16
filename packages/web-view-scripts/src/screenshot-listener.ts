import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type { WebViewMessageEvent_MessageData } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import {
  devvitScriptFileName,
  devvitScriptUrl,
  screenshotScriptFileName,
} from '@devvit/shared-types/web-view-scripts-constants.js';

const fallbackScriptUrl = new URL(screenshotScriptFileName, devvitScriptUrl).toString();

export function getScreenshotModuleUrl(scriptSrc: string | undefined): string {
  const trimmedScriptSrc = scriptSrc?.trim();
  if (trimmedScriptSrc) {
    try {
      const scriptUrl = new URL(trimmedScriptSrc);
      if (scriptUrl.pathname.endsWith(`/${devvitScriptFileName}`)) {
        return new URL(screenshotScriptFileName, scriptUrl).toString();
      }
    } catch {
      // no-op, fall through to return below
    }
  }
  return fallbackScriptUrl;
}

async function onMessage(
  event: MessageEvent<WebViewMessageEvent_MessageData>,
  scriptSrc: string | undefined
): Promise<void> {
  const envelope = event.data;
  if (envelope?.type !== 'devvit-message' || envelope.data == null) return;
  const payload = envelope.data;
  if (payload.screenshotRequest == null) {
    return;
  }
  if (typeof payload.id !== 'string') {
    return;
  }

  let dataUrl: string | undefined;
  let errorMessage: string | undefined;
  try {
    const screenshotModulePath = getScreenshotModuleUrl(scriptSrc);
    // eslint-disable-next-line
    const { captureScreenshot } = await import(screenshotModulePath);
    dataUrl = await captureScreenshot();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
  }
  emitEffect(
    { type: EffectType.EFFECT_SCREENSHOT_RESPONSE, screenshot: { dataUrl, error: errorMessage } },
    payload.id
  );
}

export function initScreenshotRequestListener(scriptSrc: string): void {
  addEventListener('message', (event) => {
    void onMessage(event, scriptSrc);
  });
}
