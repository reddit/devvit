import type { RealtimeSubscriptionEvent } from '@devvit/protos';
import { RealtimeSubscriptionStatus } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { Data } from '../../../types/data.js';
import type {
  UseChannelHook,
  UseChannelHookState,
  UseChannelResult,
} from '../../../types/hooks.js';
import { Hook } from '../../../types/hooks.js';
import type { ChannelOptions } from '../../../types/realtime.js';
import { ChannelStatus } from '../../../types/realtime.js';
import type { BlocksReconciler } from './BlocksReconciler.js';

export function makeUseChannelHook(reconciler: BlocksReconciler): UseChannelHook {
  function useChannel(options: ChannelOptions): UseChannelResult {
    const hookIndex = reconciler.currentHookIndex;
    const currentState = reconciler.getCurrentComponentState<UseChannelHookState>();
    const previousState = reconciler.getPreviousComponentState<UseChannelHookState>();

    const appId = reconciler.metadata[Header.App]?.values[0];
    assertNonNull<string | undefined>(appId, 'useChannel - app is missing from Context');

    const installationId = reconciler.metadata[Header.Installation]?.values[0];
    assertNonNull<string | undefined>(
      installationId,
      'useChannel - installation is missing from Context'
    );

    async function send(data: Data): Promise<void> {
      const name = currentState[hookIndex].channel;
      if (currentState[hookIndex].active) {
        if (currentState[hookIndex].connected) {
          await reconciler.realtime.send(name, data);
        } else {
          throw Error(`Failed to send to channel '${name}'; it is active but not yet connected`);
        }
      } else {
        throw Error(`Cannot send a message over inactive channel: ${name}`);
      }
    }

    function subscribe(): void {
      if (!currentState[hookIndex].active) {
        const name = currentState[hookIndex].channel;
        currentState[hookIndex].active = true;

        reconciler.addRealtimeChannel(name);
      }
    }

    function unsubscribe(): void {
      if (currentState[hookIndex].active) {
        const name = currentState[hookIndex].channel;
        currentState[hookIndex].active = false;

        reconciler.removeRealtimeChannel(name);
      }
    }

    function hook(event: RealtimeSubscriptionEvent): () => Promise<void> {
      return async () => {
        let result;
        switch (event.status) {
          case RealtimeSubscriptionStatus.REALTIME_SUBSCRIBED:
            currentState[hookIndex].connected = true;
            result = options.onSubscribed?.();
            break;
          case RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED:
            currentState[hookIndex].connected = false;
            result = options.onUnsubscribed?.();
            break;
          default:
            result = options.onMessage(event.event?.data ?? {});
            break;
        }

        await result;
      };
    }

    let hookState: UseChannelHookState = {
      channel: `${appId}:${installationId}:${options.name}`,
      active: false,
      connected: false,
      preventCallback: false,
      type: Hook.CHANNEL,
    };

    if (hookIndex in currentState) {
      hookState = currentState[hookIndex];
    } else if (hookIndex in previousState) {
      hookState = previousState[hookIndex];
    }

    const event = reconciler.realtimeEvent;

    if (reconciler.isInitialRender) {
      hookState.active = false;
    } else if (event && hookState.active && event.event!.channel === hookState.channel) {
      if (!hookState.preventCallback) {
        reconciler.runHook(hook(event));
      }

      reconciler.rerenderIn(0);
    }

    currentState[hookIndex] = hookState;
    reconciler.currentHookIndex++;

    let status = ChannelStatus.Unknown;
    if (hookState.active && hookState.connected) {
      status = ChannelStatus.Connected;
    } else if (hookState.active && !hookState.connected) {
      status = ChannelStatus.Connecting;
    } else if (!hookState.active && hookState.connected) {
      status = ChannelStatus.Disconnecting;
    } else if (!hookState.active && !hookState.connected) {
      status = ChannelStatus.Disconnected;
    }

    return {
      subscribe,
      unsubscribe,
      send,
      status,
    };
  }

  return useChannel;
}
