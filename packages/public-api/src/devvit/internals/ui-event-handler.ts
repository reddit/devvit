import type { HandleUIEventRequest, HandleUIEventResponse, Metadata } from '@devvit/protos';
import { EffectType, UIEventHandlerDefinition } from '@devvit/protos';
import type { DeepPartial } from '@devvit/shared-types/BuiltinTypes.js';
import type { Config } from '@devvit/shared-types/Config.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';
import cloneDeep from 'clone-deep';
import isEqual from 'lodash.isequal';
import { makeAPIClients } from '../../apis/makeAPIClients.js';
import { getEffectsFromUIClient } from '../../apis/ui/helpers/getEffectsFromUIClient.js';
import { getFormValues } from '../../apis/ui/helpers/getFormValues.js';
import { Devvit } from '../Devvit.js';
import { BlocksReconciler } from './blocks/BlocksReconciler.js';
import { getContextFromMetadata } from './context.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';
import { getMenuItemById } from './menu-items.js';
import { Header } from '@devvit/shared-types/Header.js';

async function handleUIEvent(
  req: HandleUIEventRequest,
  metadata: Metadata
): Promise<DeepPartial<HandleUIEventResponse>> {
  // Keep track of the original state so we can check if it was updated.
  const originalState = req.state ?? {};
  const state = cloneDeep(originalState);

  const apiClients = makeAPIClients({
    ui: true,
    metadata,
  });

  if (req.event?.formSubmitted && req.event.formSubmitted.formId) {
    const formKey = req.event.formSubmitted.formId as FormKey;

    if (formKey.includes('form.hook.')) {
      if (Devvit.customPostType) {
        const blocksReconciler = new BlocksReconciler(
          (_props: {}, context: Devvit.Context) => Devvit.customPostType?.render(context) ?? null,
          req.event,
          req.state,
          metadata,
          undefined
        );

        await blocksReconciler.reconcile();

        return {
          state: blocksReconciler.state,
          effects: blocksReconciler.getEffects(),
        };
      }
    }

    const formDefinition = Devvit.formDefinitions.get(formKey);

    if (!formDefinition) {
      throw new Error(`Form with key ${formKey} not found`);
    }

    let postId: string | undefined;
    let commentId: string | undefined;

    if (state.__contextAction) {
      const { actionId, thingId } = state.__contextAction;
      const menuItem = getMenuItemById(actionId);

      if (menuItem?.location === 'post') {
        postId = thingId;
      } else if (menuItem?.location === 'comment') {
        commentId = thingId;
      }
    }

    const context: Devvit.Context = Object.assign(
      apiClients,
      getContextFromMetadata(metadata, postId, commentId),
      {
        uiEnvironment: {
          timezone: metadata[Header.Timezone]?.values[0],
          locale: metadata[Header.Language]?.values[0],
        },
      }
    );

    await formDefinition.onSubmit(
      {
        values: getFormValues(req.event.formSubmitted.results),
      },
      context
    );
  } else if (req.event?.realtimeEvent) {
    if (Devvit.customPostType) {
      const blocksReconciler = new BlocksReconciler(
        (_props: {}, context: Devvit.Context) => Devvit.customPostType?.render(context) ?? null,
        req.event,
        req.state,
        metadata,
        undefined
      );

      await blocksReconciler.reconcile();

      return {
        state: blocksReconciler.state,
        effects: blocksReconciler.getEffects(),
      };
    }
  } else if (req.event?.toastAction) {
    throw new Error('Toast actions not yet implemented');
  }

  // Check if the state was updated to determine if we need to rerender.
  const stateWasUpdated = !isEqual(originalState, state);

  const uiEffects = getEffectsFromUIClient(apiClients.ui);
  const effects = stateWasUpdated
    ? [
        ...uiEffects,
        {
          type: EffectType.EFFECT_RERENDER_UI,
          rerenderUi: {
            delaySeconds: 0,
          },
        },
      ]
    : uiEffects;

  return {
    state,
    effects,
  };
}

export function registerUIEventHandler(config: Config): void {
  config.provides(UIEventHandlerDefinition);
  extendDevvitPrototype('HandleUIEvent', handleUIEvent);
}
