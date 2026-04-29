import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type { WebViewTelemetryClickEffect } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/telemetry.js';

import { emitEffect } from './emit-effect.js';

type TelemetryClickPayload = WebViewTelemetryClickEffect & {
  elemTrackId: string | undefined;
};

export function emitTelemetryClickEffect(event: Pick<MouseEvent, 'target' | 'isTrusted'>): void {
  const click = TelemetryClickPayload(event.target, event.isTrusted);

  void emitEffect({
    type: EffectType.EFFECT_TELEMETRY,
    telemetry: { event: click.event, click },
    // to-do: remove once all clients support `telemetry`. Deprecated on
    //        2025-11-24.
    analytics: click,
  });
}

/**
 * This function is expensive. It does heavy DOM work.
 * @internal
 */
export function TelemetryClickPayload(
  eventTarget: EventTarget | null,
  isTrusted: boolean
): TelemetryClickPayload {
  const { definition, elemTrackId } = analyzeClickTarget(eventTarget, isTrusted);
  return { event: 'click', definition, elemTrackId };
}

function analyzeClickTarget(
  eventTarget: EventTarget | null,
  isTrusted: boolean
): Pick<TelemetryClickPayload, 'definition' | 'elemTrackId'> {
  const targetElement = getTargetElement(eventTarget);
  if (!targetElement) {
    return { definition: 'default', elemTrackId: undefined };
  }

  let definition: WebViewTelemetryClickEffect['definition'] = 'default';
  if (isTrusted) {
    const computedStyles = globalThis.window.getComputedStyle(targetElement);
    if (computedStyles?.getPropertyValue('cursor') === 'pointer') {
      definition = 'strict';
    }
  }

  let elemTrackId: string | undefined;
  let currentElement: Element | null = targetElement;

  while (currentElement) {
    if (elemTrackId === undefined) {
      const dataTrackId = currentElement.getAttribute('data-track-id');
      if (dataTrackId) {
        elemTrackId = dataTrackId;
      } else if (currentElement.id) {
        elemTrackId = currentElement.id;
      }
    }

    if (isTrusted && definition === 'default' && elementIsStrictClickTarget(currentElement)) {
      definition = 'strict';
    }

    if (elemTrackId !== undefined && (!isTrusted || definition === 'strict')) {
      break;
    }

    currentElement = currentElement.parentElement;
  }

  return { definition, elemTrackId };
}

function getTargetElement(eventTarget: EventTarget | null): Element | undefined {
  if (!eventTarget || typeof eventTarget !== 'object' || !('nodeType' in eventTarget)) {
    return undefined;
  }

  const node = eventTarget as Node;
  return node.nodeType === 1 ? (node as Element) : (node.parentElement ?? undefined);
}

function elementIsStrictClickTarget(element: Element): boolean {
  const STRICT_CLICK_TAGNAMES = ['A', 'BUTTON', 'CANVAS', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];

  return (
    STRICT_CLICK_TAGNAMES.includes(element.tagName) ||
    ['true', 'plaintext-only'].includes(element.getAttribute('contenteditable') ?? '')
  );
}
