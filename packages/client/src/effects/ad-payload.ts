import type { AdPayload } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';

/** Render-time ad data for promoted posts. Returns undefined for non-ad posts. */
export function getAdPayload(): AdPayload | undefined {
  return devvit.adPayload;
}
