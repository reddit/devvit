/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { BlockRenderEventType, UIEventScope } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, expect, test } from 'vitest';

import { Hook } from '../../../types/hooks.js';
import { Devvit } from '../../Devvit.js';
import { BlocksReconciler } from './BlocksReconciler.js';

describe('useForm', () => {
  test('setups the hook state in the initial render', async () => {
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useForm, ui }: Devvit.Context) => {
        const testForm = useForm(
          {
            title: 'Test Form',
            description: 'This is a test form',
            acceptLabel: 'Yup',
            cancelLabel: 'Nope',
            fields: [
              {
                type: 'string',
                name: 'name',
                label: 'Name',
              },
            ],
          },
          () => {}
        );
        return <button onPress={() => ui.showForm(testForm)}>Open Form</button>;
      },
      { type: BlockRenderEventType.RENDER_INITIAL },
      undefined,
      mockMetadata,
      undefined
    );

    await reconciler.render();

    expect(reconciler.state).toMatchObject({
      __renderState: {
        'root.anonymous': {
          0: {
            formKey: 'form.hook.root.anonymous.0',
            preventSubmit: false,
            type: Hook.FORM,
          },
        },
      },
    });
  });

  test('calls onSubmit when a form is submitted', async () => {
    const onSubmit = vi.fn();
    const reconciler = new BlocksReconciler(
      (_props: JSX.Props, { useForm, ui }: Devvit.Context) => {
        const testForm = useForm(
          {
            title: 'Test Form',
            description: 'This is a test form',
            acceptLabel: 'Yup',
            cancelLabel: 'Nope',
            fields: [
              {
                type: 'string',
                name: 'name',
                label: 'Name',
              },
            ],
          },
          onSubmit
        );
        return <button onPress={() => ui.showForm(testForm)}>Open Form</button>;
      },
      {
        scope: UIEventScope.ALL,
        formSubmitted: {
          formId: 'form.hook.root.anonymous.0',
          results: {
            name: {
              stringValue: 'Genghis Corgi',
              fieldType: 0,
            },
          },
        },
      },
      {
        __renderState: {
          'root.anonymous': {
            0: {
              formKey: 'form.hook.root.anonymous.0',
              preventSubmit: false,
              type: Hook.FORM,
            },
          },
        },
      },
      mockMetadata,
      undefined
    );

    await reconciler.render();

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Genghis Corgi',
    });
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
