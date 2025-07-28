import type { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import type {
  Toast as ToastProto,
  ToastAppearance,
} from '@devvit/protos/types/devvit/ui/toast/toast.js';
import type { Toast } from '@devvit/shared';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

/**
 * Shows a toast message.
 *
 * @param textOrToast - The text or toast object to display
 */
export function showToast(text: string): void;
export function showToast(toast: Toast): void;
export function showToast(textOrToast: string | Toast): void {
  let toast: ToastProto;

  if (textOrToast instanceof Object) {
    toast = {
      text: textOrToast.text,
      appearance:
        textOrToast.appearance === 'success'
          ? (1 satisfies ToastAppearance.SUCCESS)
          : (0 satisfies ToastAppearance.NEUTRAL),
    };
  } else {
    toast = {
      text: textOrToast,
    };
  }

  void emitEffect({
    showToast: {
      toast,
    },
    type: 4 satisfies EffectType.EFFECT_SHOW_TOAST,
  });
}
