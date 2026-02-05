import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { ConsentStatus } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import { emitEffectWithResponse } from '@devvit/shared-types/client/emit-effect.js';

/**
 * This method is used to check if the app has been granted all the requested scopes.
 *
 * @experimental
 * @param event The event that triggered the request, must be a trusted event.
 * @returns true if the app has been granted all the requested scopes, false otherwise.
 */
export const canRunAsUser = async (event: Event): Promise<boolean> => {
  if (!event.isTrusted) {
    console.error('CanRunAsUser effect ignored due to untrusted event');
    throw new Error('Untrusted event');
  }

  const appPermissionState = devvit.appPermissionState;

  if (!appPermissionState) {
    // Note: The app permission state will be missing when the app runs on clients that haven't implemented this feature yet.
    // "true" is the correct value for the time being, until we have all clients supporting this feature.
    return true;
  }

  if (appPermissionState.requestedScopes.length === 0) {
    // the app does not have permission to do anything as the user
    return false;
  }

  switch (appPermissionState.consentStatus) {
    case ConsentStatus.REVOKED:
      return false;
    case ConsentStatus.GRANTED:
      // If the app has been granted all the requested scopes, return true
      if (
        appPermissionState.requestedScopes.every((scope) =>
          appPermissionState.grantedScopes.includes(scope)
        )
      ) {
        return true;
      }
      // Otherwise, the sets of scopes do not overlap we emit the effect to request the scopes; continue
      break;
    case ConsentStatus.CONSENT_STATUS_UNKNOWN:
    case ConsentStatus.UNRECOGNIZED:
      // We don't know the status, so we'll have to ask.
      break;
    default: {
      appPermissionState.consentStatus satisfies never;
      break;
    }
  }

  const response = await emitEffectWithResponse({
    canRunAsUser: {
      postId: devvit.context.postId,
      appSlug: devvit.context.appName,
      subredditId: devvit.context.subredditId,
    },
    type: 11 satisfies EffectType.EFFECT_CAN_RUN_AS_USER,
  });

  return response?.consentStatus?.consentStatus === ConsentStatus.GRANTED;
};
