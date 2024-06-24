import type { JSONValue } from '@devvit/shared-types/json.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';
import { formKeyToHookId } from '@devvit/shared-types/useForm.js';
import { getFormValues } from '../../../../apis/ui/helpers/getFormValues.js';
import type { Form, FormDefinition, FormFunction, FormValues } from '../../../../index.js';
import { registerHook } from './BlocksHandler.js';
import type { RenderContext } from './RenderContext.js';
import type { EventHandler, Hook, HookRef } from './types.js';

class UseFormHook implements Hook, FormDefinition {
  hookId: string;
  state: JSONValue = null;
  onUIEvent?: EventHandler | undefined;
  onStateLoaded?: (() => void) | undefined;
  form: Form | FormFunction;
  onSubmit: (values: FormValues) => void | Promise<void>;

  constructor(
    params: { hookId: string },
    form: Form | FormFunction,
    onSubmit: (values: FormValues) => void | Promise<void>
  ) {
    this.hookId = params.hookId;
    this.form = form;
    this.onSubmit = onSubmit;
    this.onUIEvent = async (event) => {
      if (event.formSubmitted) {
        await onSubmit(getFormValues(event.formSubmitted.results));
      }
    };
  }
}

export function useForm(
  form: Form | FormFunction,
  onSubmit: (values: FormValues) => void | Promise<void>
): FormKey {
  const hook = registerHook(
    { namespace: 'useForm' },
    (params) => new UseFormHook(params, form, onSubmit)
  );
  return hookRefToFormKey({ id: hook.hookId });
}

export function hookRefToFormKey(hookRef: HookRef): FormKey {
  return `form.hook.${hookRef.id}.0`;
}

export function getFormDefinition(renderContext: RenderContext, formKey: FormKey): FormValues {
  const hookId = formKeyToHookId(formKey);
  return renderContext.getHook({ id: hookId }) as UseFormHook;
}
