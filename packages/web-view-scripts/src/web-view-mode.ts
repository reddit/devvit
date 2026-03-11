import type { WebViewMessageEvent_MessageData } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';

import { updateMode } from './devvit-global.js';

/** @internal */
export function initWebViewMode(): void {
  addEventListener('message', onWebViewMessage);
}

/** @internal */
export function onWebViewMessage(ev: MessageEvent<WebViewMessageEvent_MessageData>): void {
  if (ev.data?.type !== 'devvit-message') return;
  if (!ev.data?.data?.immersiveModeEvent) return;
  updateMode(ev.data.data.immersiveModeEvent.immersiveMode);
}
