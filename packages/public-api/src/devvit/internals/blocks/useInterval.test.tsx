/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { BlockRenderEventType } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test } from 'vitest';

import type { UseIntervalHookState } from '../../../types/hooks.js';
import { Hook } from '../../../types/hooks.js';
import { Devvit } from '../../Devvit.js';
import { BlocksReconciler } from './BlocksReconciler.js';

describe('useInterval', () => {
  test('setups the hook state in the initial render', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(() => {}, 100);
        return <button onPress={() => interval.start()}>Start</button>;
      },
      { type: BlockRenderEventType.RENDER_INITIAL },
      undefined,
      mockMetadata,
      undefined
    );

    await reconciler.render();

    expect(reconciler.state).toEqual({
      __renderState: {
        'root.anonymous': [
          {
            lastRun: undefined,
            running: false,
            preventCallback: false,
            type: Hook.INTERVAL,
          },
        ],
      },
    });
  });

  test('start', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(() => {}, 100);
        return <button onPress={() => interval.start()}>Start</button>;
      },
      { id: `button.onPress`, type: BlockRenderEventType.RENDER_USER_ACTION },
      {
        __renderState: {
          'root.anonymous': [
            {
              lastRun: undefined,
              running: false,
              preventCallback: false,
            },
          ],
        },
      },
      mockMetadata,
      undefined
    );

    await reconciler.render();

    const componentState = reconciler.state.__renderState['root.anonymous'];
    const hookValue = componentState[0] as UseIntervalHookState;
    expect(reconciler.effects.length).toBe(1);
    expect(hookValue.running).toBe(true);
    expect(hookValue.lastRun).toBeDefined();
  });

  test('should emit an interval effect, even if the interval is already running', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(() => {}, 100);
        return <button onPress={() => interval.start()}>Start</button>;
      },
      { id: `button.onPress`, type: BlockRenderEventType.RENDER_USER_ACTION },
      {
        __renderState: {
          'root.anonymous': [
            {
              lastRun: undefined,
              running: true,
              preventCallback: false,
            },
          ],
        },
      },
      mockMetadata,
      undefined
    );

    await reconciler.render();

    const componentState = reconciler.state.__renderState['root.anonymous'];
    const hookValue = componentState[0] as UseIntervalHookState;
    expect(reconciler.effects.length).toBe(1);
    expect(hookValue.running).toBe(true);
    expect(hookValue.lastRun).toBeDefined();
  });

  test('start func preserve lastRun value if exist', async () => {
    const callback = vi.fn();
    const lastRun = Date.now() - 70;
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(callback, 100);
        interval.start();
        return <text>Text</text>;
      },
      { type: BlockRenderEventType.RENDER_EFFECT_EVENT },
      {
        __renderState: {
          'root.anonymous': [
            {
              lastRun: lastRun,
              running: true,
              preventCallback: false,
            },
          ],
        },
      },
      mockMetadata,
      undefined
    );

    // render
    await reconciler.render();
    expect(callback).not.toHaveBeenCalled();

    const componentState = reconciler.state.__renderState['root.anonymous'];
    const hookValue = componentState[0] as UseIntervalHookState;
    expect(hookValue.lastRun).toBe(lastRun);
  });

  test('starts if delay is less than 100ms', async () => {
    const consoleSpy = vi.spyOn(console, 'error');
    const delayMs = 50;
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(() => {}, delayMs);
        return <button onPress={() => interval.start()}>Start</button>;
      },
      { id: `button.onPress`, type: BlockRenderEventType.RENDER_USER_ACTION },
      {
        __renderState: {
          'root.anonymous': [
            {
              lastRun: undefined,
              running: false,
              preventCallback: false,
            },
          ],
        },
      },
      mockMetadata,
      undefined
    );

    await reconciler.render();

    expect(consoleSpy).toHaveBeenCalledWith(
      `useInterval delay must be at least 100ms. Your interval of ${delayMs}ms was automatically extended.`
    );
  });

  test('does not start if there is a running interval', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(() => {}, 100);
        const intervalTwo = useInterval(() => {}, 100);
        interval.start();
        intervalTwo.start();
        return <text>Hello</text>;
      },
      { id: `button.onPress`, type: BlockRenderEventType.RENDER_USER_ACTION },
      {
        __renderState: {
          'root.anonymous': [
            {
              lastRun: undefined,
              running: false,
              preventCallback: false,
            },
          ],
        },
      },
      mockMetadata,
      undefined
    );

    await expect(reconciler.render()).rejects.toThrowError(
      'Only one useInterval hook may be running at a time'
    );
  });

  test('stop', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(() => {}, 100);
        return <button onPress={() => interval.stop()}>Stop</button>;
      },
      { id: `button.onPress`, type: BlockRenderEventType.RENDER_USER_ACTION },
      {
        __renderState: {
          'root.anonymous': [
            {
              lastRun: Date.now() - 100,
              running: true,
              preventCallback: false,
            },
          ],
        },
      },
      mockMetadata,
      undefined
    );

    await reconciler.render();

    const componentState = reconciler.state.__renderState['root.anonymous'];
    const hookValue = componentState[0] as UseIntervalHookState;
    expect(hookValue.running).toBe(false);
    expect(hookValue.lastRun).toBeUndefined();
  });

  test('does not call the callback on the initial render', async () => {
    const callback = vi.fn();
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(callback, 100);
        return <button onPress={() => interval.start()}>Start</button>;
      },
      { type: BlockRenderEventType.RENDER_INITIAL },
      undefined,
      mockMetadata,
      undefined
    );

    await reconciler.render();

    expect(callback).not.toHaveBeenCalled();
  });

  test('does not call the callback on user action events', async () => {
    const callback = vi.fn();
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(callback, 100);
        return <button onPress={() => interval.start()}>Start</button>;
      },
      { id: `button.onPress`, type: BlockRenderEventType.RENDER_USER_ACTION },
      {
        __renderState: {
          'root.anonymous': [
            {
              lastRun: Date.now() - 100,
              running: true,
              preventCallback: false,
            },
          ],
        },
      },
      mockMetadata,
      undefined
    );

    await reconciler.render();

    expect(callback).not.toHaveBeenCalled();
  });

  test('calls the callback after the interval', async () => {
    const callback = vi.fn();

    const lastRun = Date.now() - 1050;

    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(callback, 100);
        return <button onPress={() => interval.start()}>Start</button>;
      },
      { type: BlockRenderEventType.RENDER_EFFECT_EVENT },
      {
        __renderState: {
          'root.anonymous': [
            {
              lastRun,
              running: true,
              preventCallback: false,
            },
          ],
        },
      },
      mockMetadata,
      undefined
    );

    await reconciler.render();

    expect(callback).toHaveBeenCalled();
  });

  test('handles async callback', async () => {
    const callback = vi.fn().mockReturnValue(Promise.resolve());

    const lastRun = Date.now() - 1050;

    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useInterval }: Devvit.Context) => {
        const interval = useInterval(callback, 100);
        return <button onPress={() => interval.start()}>Start</button>;
      },
      { type: BlockRenderEventType.RENDER_EFFECT_EVENT },
      {
        __renderState: {
          'root.anonymous': [
            {
              lastRun,
              running: true,
              preventCallback: false,
            },
          ],
        },
      },
      mockMetadata,
      undefined
    );

    await reconciler.render();

    expect(callback).toHaveBeenCalled();
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
};
