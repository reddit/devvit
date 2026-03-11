import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type { WebViewMessageEvent_MessageData } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

async function onMessage(event: MessageEvent<WebViewMessageEvent_MessageData>): Promise<void> {
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
    const screenshotModulePath = './screenshot.v1.min.js';
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

export function initScreenshotRequestListener(): void {
  addEventListener('message', (event) => {
    void onMessage(event);
  });
}
