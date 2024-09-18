import type { RealtimeSubscriptionEvent } from '@devvit/protos';
import { RealtimeSubscriptionStatus } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import type { JSONValue } from '@devvit/shared-types/json.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';

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
  function useChannel<Message extends JSONValue>(
    options: ChannelOptions<Message>
  ): UseChannelResult<Message> {
    const debug = false;
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

    async function send(msg: Message): Promise<void> {
      if (debug) console.debug('[realtime] sends', msg);
      const name = currentState[hookIndex].channel;
      if (currentState[hookIndex].active) {
        if (currentState[hookIndex].connected) {
          await reconciler.realtime.send(name, msg);
        } else {
          throw Error(`Failed to send to channel '${name}'; it is active but not yet connected`);
        }
      } else {
        throw Error(`Cannot send a message over inactive channel: ${name}`);
      }
    }

    function subscribe(): void {
      if (!currentState[hookIndex].active) {
        if (debug) console.debug('[realtime] subscribe');
        const name = currentState[hookIndex].channel;
        currentState[hookIndex].active = true;

        reconciler.addRealtimeChannel(name);
      }
    }

    function unsubscribe(): void {
      if (currentState[hookIndex].active) {
        if (debug) console.debug('[realtime] unsubscribe');
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
            if (debug) console.debug('[realtime] onSubscribed()');
            currentState[hookIndex].connected = true;
            result = options.onSubscribed?.();
            break;
          case RealtimeSubscriptionStatus.REALTIME_UNSUBSCRIBED:
            if (debug) console.debug('[realtime] onUnsubscribed()');
            currentState[hookIndex].connected = false;
            result = options.onUnsubscribed?.();
            break;
          default:
            if (debug) console.debug('[realtime] receives', event.event?.data);
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
