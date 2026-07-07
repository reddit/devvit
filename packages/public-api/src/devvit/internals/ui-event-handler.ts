import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type { HandleUIEventRequest } from '@devvit/protos/json/devvit/ui/events/v1alpha/handle_ui.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type { UIEventHandler } from '@devvit/protos/types/devvit/ui/events/v1alpha/handle_ui.js';
// eslint-disable-next-line no-restricted-imports
import { HandleUIEventResponse } from '@devvit/protos/types/devvit/ui/events/v1alpha/handle_ui.js';
// eslint-disable-next-line no-restricted-imports
import { UIEventHandlerDefinition } from '@devvit/protos/types/devvit/ui/events/v1alpha/handle_ui.js';
import type { Config } from '@devvit/shared-types/Config.js';
import { Header } from '@devvit/shared-types/Header.js';
import { type FormKey } from '@devvit/shared-types/useForm.js';
import cloneDeep from 'clone-deep';
import { isEqual } from 'moderndash';

import { makeAPIClients } from '../../apis/makeAPIClients.js';
import { getEffectsFromUIClient } from '../../apis/ui/helpers/getEffectsFromUIClient.js';
import { getFormValues } from '../../apis/ui/helpers/getFormValues.js';
import { isT1ID, isT3ID } from '../../types/tid.js';
import { Devvit } from '../Devvit.js';
import { getContextFromMetadata } from './context.js';
import {
  addFormSubmitGrants,
  getFormIdsFromEffects,
  validateFormSubmitGrant,
} from './form-submit-grants.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';
import { getMenuItemById } from './menu-items.js';

async function handleUIEvent(
  req: HandleUIEventRequest,
  metadata: Metadata
): Promise<HandleUIEventResponse> {
  // Keep track of the original state so we can check if it was updated.
  const originalState = req.state ?? {};
  const state = cloneDeep(originalState);

  const apiClients = makeAPIClients({
    ui: true,
    metadata,
  });

  let postId: string | undefined = metadata[Header.Post]?.values[0];
  let commentId: string | undefined = metadata[Header.Comment]?.values[0];

  const formSubmitted = req.event?.formSubmitted;
  if (formSubmitted?.formId) {
    if (state.__contextAction) {
      const { actionId, thingId } = state.__contextAction;
      const menuItem = getMenuItemById(actionId);

      if (menuItem?.location.includes('post') && isT3ID(thingId)) {
        postId = thingId;
      } else if (menuItem?.location.includes('comment') && isT1ID(thingId)) {
        commentId = thingId;
      }
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

  if (formSubmitted?.formId) {
    const formKey = formSubmitted.formId as FormKey;
    const formDefinition = Devvit.formDefinitions?.get(formKey);

    if (!formDefinition) {
      throw new Error(`Form with key ${formKey} not found`);
    }

    // If the UI event is a form submission, validate that the user was granted access to submit this form
    await validateFormSubmitGrant(context, formKey);

    await formDefinition.onSubmit(
      {
        values: getFormValues(formSubmitted.results),
      },
      context
    );
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

  // Forms opened by this ui event will be valid for this user to submit for the next 10 minutes.
  await addFormSubmitGrants(context, getFormIdsFromEffects(effects));

  return HandleUIEventResponse.fromJSON({
    state,
    effects,
  });
}

export function registerUIEventHandler(config: Config): void {
  config.provides(UIEventHandlerDefinition);
  extendDevvitPrototype<UIEventHandler>('HandleUIEvent', handleUIEvent);
}
