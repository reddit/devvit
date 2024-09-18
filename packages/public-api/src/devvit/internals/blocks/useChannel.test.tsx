/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { BlockRenderEventType, BlockRenderRequest, EffectType } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test } from 'vitest';

import { Hook } from '../../../types/hooks.js';
import { Devvit } from '../../Devvit.js';
import { BlocksReconciler } from './BlocksReconciler.js';

describe('useChannel', () => {
  test('setup hook state in the initial render', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useChannel }: Devvit.Context) => {
        const channel = useChannel({
          name: 'app-events',
          onMessage: () => {},
          onSubscribed: () => {},
        });
        channel.subscribe();
        return <button onPress={() => channel.send({})}>Start</button>;
      },
      BlockRenderRequest.fromPartial({
        type: BlockRenderEventType.RENDER_INITIAL,
      }),
      undefined,
      mockMetadata,
      undefined
    );

    await reconciler.render();

    const namespacedChannel = 'sample-app:sample-installation:app-events';

    expect(reconciler.state).toEqual({
      __cache: undefined,
      __postData: undefined,
      __realtimeChannels: [namespacedChannel],
      __renderState: {
        'root.anonymous': [
          {
            channel: namespacedChannel,
            active: true,
            connected: false,
            preventCallback: false,
            type: Hook.CHANNEL,
          },
        ],
      },
    });
    expect(reconciler.getEffects().length).toBe(1);
    expect(reconciler.getEffects()).toStrictEqual([
      {
        type: EffectType.EFFECT_REALTIME_SUB,
        realtimeSubscriptions: {
          subscriptionIds: [namespacedChannel],
        },
      },
    ]);
  });
});

const mockMetadata = {
  [Header.AppUser]: {
    values: ['t2_appuser'],
  },
  [Header.Subreddit]: {
    values: ['t5_devvit'],
  },
  [Header.User]: {
    values: ['t2_user'],
  },
  [Header.App]: {
    values: ['sample-app'],
  },
  [Header.Installation]: {
    values: ['sample-installation'],
  },
};
