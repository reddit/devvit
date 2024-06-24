import { getFormValues } from '../../../apis/ui/helpers/getFormValues.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';
import type { Form, FormFunction, FormValues } from '../../../types/form.js';
import type { UseFormHook, UseFormHookState } from '../../../types/hooks.js';
import { Hook } from '../../../types/hooks.js';
import type { BlocksReconciler } from './BlocksReconciler.js';

export function makeUseFormHook(reconciler: BlocksReconciler): UseFormHook {
  function useForm(
    form: Form | FormFunction,
    onSubmit: (values: FormValues) => void | Promise<void>
  ): FormKey {
    const hookIndex = reconciler.currentHookIndex;
    const componentKey = reconciler.getCurrentComponentKey();
    const currentState = reconciler.getCurrentComponentState<UseFormHookState>();
    const previousState = reconciler.getPreviousComponentState<UseFormHookState>();

    const formKey: FormKey = `form.hook.${componentKey}.${hookIndex}`;

    let hookState: UseFormHookState = {
      formKey,
      preventSubmit: false,
      type: Hook.FORM,
    };

    if (hookIndex in currentState) {
      hookState = currentState[hookIndex];
    } else if (hookIndex in previousState) {
      hookState = previousState[hookIndex];
    }

    currentState[hookIndex] = hookState;
    reconciler.forms.set(formKey, form);

    const formSubmittedEvent = reconciler.formSubmittedEvent;

    if (formSubmittedEvent && !hookState.preventSubmit) {
      if (formSubmittedEvent.formId === formKey) {
        reconciler.runHook(async () => {
          const response = onSubmit(getFormValues(formSubmittedEvent.results));

          if (response && response instanceof Promise) {
            await response;
          }

          reconciler.rerenderIn(0);
        });
      }
    }

    currentState[hookIndex].preventSubmit = false;
    reconciler.currentHookIndex++;

    return formKey;
  }

  return useForm;
}
