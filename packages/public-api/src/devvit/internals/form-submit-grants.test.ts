import type { HandleUIEventRequest } from '@devvit/protos/json/devvit/ui/events/v1alpha/handle_ui.js';
import { FormFieldType } from '@devvit/protos/json/devvit/ui/form_builder/v1alpha/type.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
import type { Config } from '@devvit/shared-types/Config.js';
import { Header } from '@devvit/shared-types/Header.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { FormDefinition } from '../../types/form.js';
import type { MenuItem } from '../../types/index.js';
import { Devvit } from '../Devvit.js';
import { addFormSubmitGrants, validateFormSubmitGrant } from './form-submit-grants.js';
import { registerMenuItems } from './menu-items.js';
import { registerUIEventHandler } from './ui-event-handler.js';

const userId = 't2_user';
const subredditId = 't5_subreddit';
const thingId = 't3_post';
const commentThingId = 't1_comment';
const actionId = 'menuItem.0';

type Context = Parameters<typeof validateFormSubmitGrant>[0];
type RegisteredContextAction = {
  OnAction: (
    req: {
      actionId: string;
      comment?: { id: string };
      post?: { id: string };
      subreddit?: { id: string };
    },
    metadata: Metadata
  ) => Promise<unknown>;
};
type RegisteredUIEventHandler = {
  HandleUIEvent: (req: HandleUIEventRequest, metadata: Metadata) => Promise<unknown>;
};

function formSubmitGrantKey(formId: string): string {
  const keyParts = [userId, subredditId, formId].map(encodeURIComponent).join(':');
  return `devvit:form-submit-grant:${keyParts}`;
}

function makeContext({
  redisValues = {},
}: {
  redisValues?: Record<string, string>;
} = {}): Context {
  const values = new Map(Object.entries(redisValues));

  return {
    metadata: {
      [Header.User]: { values: [userId] },
      [Header.Subreddit]: { values: [subredditId] },
    },
    reddit: {},
    redis: {
      get: vi.fn(async (key: string) => values.get(key) ?? null),
      set: vi.fn(async (key: string, value: string) => {
        values.set(key, value);
      }),
      expire: vi.fn(),
    },
  } as unknown as Context;
}

function makeHandleUIEventRequest(formId: string, targetId = thingId): HandleUIEventRequest {
  return {
    state: {
      __contextAction: {
        actionId,
        thingId: targetId,
      },
    },
    event: {
      formSubmitted: {
        formId,
        results: {},
      },
    },
  };
}

function makeContextActionRequest(): Parameters<RegisteredContextAction['OnAction']>[0] {
  return {
    actionId,
    post: {
      id: 'post',
    },
  };
}

function makeMetadata(overrides: Metadata = {}): Metadata {
  return {
    [Header.User]: { values: [userId] },
    [Header.Subreddit]: { values: [subredditId] },
    [Header.SubredditName]: { values: ['test_subreddit'] },
    [Header.AppUser]: { values: ['t2_app_user'] },
    [Header.Post]: { values: [thingId] },
    ...overrides,
  };
}

function registerHandleUIEvent(): RegisteredUIEventHandler['HandleUIEvent'] {
  registerUIEventHandler({ provides: vi.fn() } as unknown as Config);
  return (Devvit as unknown as { prototype: RegisteredUIEventHandler }).prototype.HandleUIEvent;
}

function registerOnAction(): RegisteredContextAction['OnAction'] {
  registerMenuItems({ provides: vi.fn() } as unknown as Config);
  return (Devvit as unknown as { prototype: RegisteredContextAction }).prototype.OnAction;
}

function mockFormDefinitions(onSubmitByFormId: Record<string, ReturnType<typeof vi.fn>>) {
  const formDefinitions = new Map<FormKey, FormDefinition>(
    Object.entries(onSubmitByFormId).map(([formId, onSubmit]) => [
      formId as FormKey,
      {
        form: {
          fields: [],
          title: 'Test form',
        },
        onSubmit: onSubmit as FormDefinition['onSubmit'],
      },
    ])
  );
  vi.spyOn(Devvit, 'formDefinitions', 'get').mockReturnValue(formDefinitions);
}

function mockRedisPlugin(redisValues: Record<string, string> = {}) {
  const values = new Map(Object.entries(redisValues));
  const redisPlugin = {
    Get: vi.fn(async ({ key }: { key: string }) =>
      values.has(key) ? { value: values.get(key) } : null
    ),
    Set: vi.fn(async ({ key, value }: { key: string; value: string; expiration?: number }) => {
      values.set(key, value);
      return { value };
    }),
    Expire: vi.fn(async (_request: { key: string; seconds: number }) => ({})),
  };

  vi.spyOn(Devvit, 'redisPlugin', 'get').mockReturnValue(redisPlugin as never);
  return redisPlugin;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('form submit handler grant behavior', () => {
  test('submits a form opened by an app context action', async () => {
    const onSubmit = vi.fn();
    const formKey = Devvit.createForm(
      {
        title: 'Approval form',
        fields: [{ label: 'Decision', name: 'decision', type: 'string' }],
      },
      onSubmit
    );
    const registeredActionId = `menuItem.${Devvit.menuItems.length}`;
    const onPress = vi.fn((_event, context) => {
      context.ui.showForm(formKey);
    });
    Devvit.addMenuItem({
      label: 'Open approval form',
      location: 'post',
      onPress,
    });
    const redisPlugin = mockRedisPlugin();
    const onAction = registerOnAction();
    const handleUIEvent = registerHandleUIEvent();

    const actionResponse = (await onAction(
      {
        actionId: registeredActionId,
        post: {
          id: 'post',
        },
      },
      makeMetadata()
    )) as { effects: { showForm?: { form?: { id?: string } } }[] };
    const openedFormId = actionResponse.effects[0]?.showForm?.form?.id;

    expect(onPress).toHaveBeenCalledOnce();
    expect(openedFormId).toBe(formKey);
    expect(redisPlugin.Set.mock.calls[0]?.[0].key).toBe(formSubmitGrantKey(formKey));

    await expect(
      handleUIEvent(
        {
          state: {
            __contextAction: {
              actionId: registeredActionId,
              thingId,
            },
          },
          event: {
            formSubmitted: {
              formId: formKey,
              results: {
                decision: {
                  fieldType: FormFieldType.STRING,
                  stringValue: 'approve',
                },
              },
            },
          },
        },
        makeMetadata()
      )
    ).resolves.toBeDefined();

    expect(redisPlugin.Get.mock.calls[0]?.[0].key).toBe(formSubmitGrantKey(formKey));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      values: {
        decision: 'approve',
      },
    });
    expect(onSubmit.mock.calls[0]?.[1].postId).toBe(thingId);
  });

  test('allows a custom post hook form submit with a matching form grant', async () => {
    const onSubmit = vi.fn();
    const formId = 'form.hook.test-hook.0';
    mockFormDefinitions({ [formId]: onSubmit });
    const redisPlugin = mockRedisPlugin({
      [formSubmitGrantKey(formId)]: JSON.stringify({
        openedAt: 123,
      }),
    });

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        {
          state: {
            __postData: {
              thingId,
            },
          },
          event: {
            hook: 'test-hook',
            formSubmitted: {
              formId,
              results: {},
            },
          },
        },
        makeMetadata()
      )
    ).resolves.toBeDefined();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[1].postId).toBe(thingId);
    expect(redisPlugin.Get.mock.calls[0]?.[0].key).toBe(formSubmitGrantKey(formId));
  });

  test('rejects a custom post hook form submit without a matching form grant', async () => {
    const onSubmit = vi.fn();
    const formId = 'form.hook.test-hook.0';
    mockFormDefinitions({ [formId]: onSubmit });
    mockRedisPlugin();

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        {
          state: {
            __postData: {
              thingId,
            },
          },
          event: {
            hook: 'test-hook',
            formSubmitted: {
              formId,
              results: {},
            },
          },
        },
        makeMetadata()
      )
    ).rejects.toThrow(`Form ${formId} was not opened by this user in this subreddit`);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('rejects a root form submit without context action state', async () => {
    const onSubmit = vi.fn();
    mockFormDefinitions({ 'form.0': onSubmit });
    mockRedisPlugin();

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        {
          state: {
            __postData: {
              thingId,
            },
          },
          event: {
            formSubmitted: {
              formId: 'form.0',
              results: {},
            },
          },
        },
        makeMetadata()
      )
    ).rejects.toThrow('Form form.0 was not opened by this user in this subreddit');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('allows a custom post root form submit with a matching form grant', async () => {
    const onSubmit = vi.fn();
    mockFormDefinitions({ 'form.0': onSubmit });
    const redisPlugin = mockRedisPlugin({
      [formSubmitGrantKey('form.0')]: JSON.stringify({
        openedAt: 123,
      }),
    });

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        {
          state: {
            __postData: {
              thingId,
            },
          },
          event: {
            formSubmitted: {
              formId: 'form.0',
              results: {},
            },
          },
        },
        makeMetadata()
      )
    ).resolves.toBeDefined();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[1].postId).toBe(thingId);
    expect(redisPlugin.Get.mock.calls[0]?.[0].key).toBe(formSubmitGrantKey('form.0'));
  });

  test('allows any matching form grant to satisfy a context action submit', async () => {
    const onSubmit = vi.fn();
    mockFormDefinitions({ 'form.0': onSubmit });
    const redisPlugin = mockRedisPlugin({
      [formSubmitGrantKey('form.0')]: JSON.stringify({
        openedAt: 123,
      }),
    });
    vi.spyOn(Devvit, 'menuItems', 'get').mockReturnValue([
      {
        label: 'Public action',
        location: 'post',
        onPress: vi.fn(),
      } as MenuItem,
    ]);

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(makeHandleUIEventRequest('form.0'), makeMetadata())
    ).resolves.toBeDefined();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[1].postId).toBe(thingId);
    expect(redisPlugin.Get.mock.calls[0]?.[0].key).toBe(formSubmitGrantKey('form.0'));
  });

  test('preserves metadata post id for comment action submits', async () => {
    const onSubmit = vi.fn();
    mockFormDefinitions({ 'form.0': onSubmit });
    mockRedisPlugin({
      [formSubmitGrantKey('form.0')]: JSON.stringify({
        openedAt: 123,
      }),
    });
    vi.spyOn(Devvit, 'menuItems', 'get').mockReturnValue([
      {
        label: 'Comment action',
        location: 'comment',
        onPress: vi.fn(),
      } as MenuItem,
    ]);

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        makeHandleUIEventRequest('form.0', commentThingId),
        makeMetadata({
          [Header.Comment]: { values: [commentThingId] },
        })
      )
    ).resolves.toBeDefined();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[1].postId).toBe(thingId);
    expect(onSubmit.mock.calls[0]?.[1].commentId).toBe(commentThingId);
  });

  test('does not assign comment action target to post id for post and comment actions', async () => {
    const onSubmit = vi.fn();
    mockFormDefinitions({ 'form.0': onSubmit });
    mockRedisPlugin({
      [formSubmitGrantKey('form.0')]: JSON.stringify({
        openedAt: 123,
      }),
    });
    vi.spyOn(Devvit, 'menuItems', 'get').mockReturnValue([
      {
        label: 'Post and comment action',
        location: ['post', 'comment'],
        onPress: vi.fn(),
      } as MenuItem,
    ]);

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        makeHandleUIEventRequest('form.0', commentThingId),
        makeMetadata({
          [Header.Post]: { values: [''] },
          [Header.Comment]: { values: [commentThingId] },
        })
      )
    ).resolves.toBeDefined();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[1].postId).toBeUndefined();
    expect(onSubmit.mock.calls[0]?.[1].commentId).toBe(commentThingId);
  });

  test('ignores context action state when action id no longer resolves', async () => {
    const onSubmit = vi.fn();
    mockFormDefinitions({ 'form.0': onSubmit });
    mockRedisPlugin({
      [formSubmitGrantKey('form.0')]: JSON.stringify({
        openedAt: 123,
      }),
    });
    vi.spyOn(Devvit, 'menuItems', 'get').mockReturnValue([]);

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        makeHandleUIEventRequest('form.0', 't3_tampered'),
        makeMetadata({
          [Header.Post]: { values: [''] },
          [Header.Comment]: { values: [commentThingId] },
        })
      )
    ).resolves.toBeDefined();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[1].postId).toBeUndefined();
    expect(onSubmit.mock.calls[0]?.[1].commentId).toBe(commentThingId);
  });

  test('allows the same form through a moderator-only context action and custom post', async () => {
    const hookFormId = 'form.hook.test-hook.0';
    const hookSubmit = vi.fn((_ev, context) => {
      context.ui.showForm('form.0' as FormKey);
    });
    const rootSubmit = vi.fn();
    const actionPress = vi.fn((_ev, context) => {
      context.ui.showForm('form.0' as FormKey);
    });
    mockFormDefinitions({ [hookFormId]: hookSubmit, 'form.0': rootSubmit });
    vi.spyOn(Devvit, 'menuItems', 'get').mockReturnValue([
      {
        label: 'Mod action',
        location: 'post',
        forUserType: ['moderator'],
        onPress: actionPress,
      } as MenuItem,
    ]);

    const redisPlugin = mockRedisPlugin({
      [formSubmitGrantKey(hookFormId)]: JSON.stringify({
        openedAt: 123,
      }),
    });
    const onAction = registerOnAction();
    const handleUIEvent = registerHandleUIEvent();

    await expect(onAction(makeContextActionRequest(), makeMetadata())).resolves.toBeDefined();

    expect(actionPress).toHaveBeenCalledOnce();
    expect(redisPlugin.Set.mock.calls[0]?.[0].key).toBe(formSubmitGrantKey('form.0'));

    await expect(
      handleUIEvent(
        {
          state: {
            __postData: {
              thingId,
            },
          },
          event: {
            hook: 'test-hook',
            formSubmitted: {
              formId: hookFormId,
              results: {},
            },
          },
        },
        makeMetadata()
      )
    ).resolves.toBeDefined();

    expect(hookSubmit).toHaveBeenCalledOnce();
    expect(redisPlugin.Set.mock.calls[1]?.[0].key).toBe(formSubmitGrantKey('form.0'));

    await expect(
      handleUIEvent(
        {
          state: {
            __postData: {
              thingId,
            },
          },
          event: {
            formSubmitted: {
              formId: 'form.0',
              results: {},
            },
          },
        },
        makeMetadata()
      )
    ).resolves.toBeDefined();

    expect(rootSubmit).toHaveBeenCalledOnce();
    expect(rootSubmit.mock.calls[0]?.[1].postId).toBe(thingId);
    expect(redisPlugin.Get.mock.calls.map(([arg]) => arg.key)).toEqual([
      formSubmitGrantKey(hookFormId),
      formSubmitGrantKey('form.0'),
    ]);
  });

  test('rejects a custom post root form submit with a grant for a different form', async () => {
    const onSubmit = vi.fn();
    mockFormDefinitions({ 'form.0': onSubmit });
    mockRedisPlugin({
      [formSubmitGrantKey('form.1')]: JSON.stringify({
        openedAt: 123,
      }),
    });

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        {
          state: {
            __postData: {
              thingId,
            },
          },
          event: {
            formSubmitted: {
              formId: 'form.0',
              results: {},
            },
          },
        },
        makeMetadata()
      )
    ).rejects.toThrow('Form form.0 was not opened by this user in this subreddit');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('uses metadata post id for a hook form submit without custom post state', async () => {
    const onSubmit = vi.fn();
    const formId = 'form.hook.test-hook.0';
    mockFormDefinitions({ [formId]: onSubmit });
    const redisPlugin = mockRedisPlugin({
      [formSubmitGrantKey(formId)]: JSON.stringify({
        openedAt: 123,
      }),
    });

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        {
          state: {},
          event: {
            hook: 'test-hook',
            formSubmitted: {
              formId,
              results: {},
            },
          },
        },
        makeMetadata()
      )
    ).resolves.toBeDefined();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[1].postId).toBe(thingId);
    expect(redisPlugin.Get.mock.calls[0]?.[0].key).toBe(formSubmitGrantKey(formId));
  });

  test('uses metadata post id when custom post state disagrees with metadata', async () => {
    const onSubmit = vi.fn();
    const formId = 'form.hook.test-hook.0';
    mockFormDefinitions({ [formId]: onSubmit });
    const redisPlugin = mockRedisPlugin({
      [formSubmitGrantKey(formId)]: JSON.stringify({
        openedAt: 123,
      }),
    });

    const handleUIEvent = registerHandleUIEvent();

    await expect(
      handleUIEvent(
        {
          state: {
            __postData: {
              thingId: 't3_other_post',
            },
          },
          event: {
            hook: 'test-hook',
            formSubmitted: {
              formId,
              results: {},
            },
          },
        },
        makeMetadata()
      )
    ).resolves.toBeDefined();

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[1].postId).toBe(thingId);
    expect(redisPlugin.Get.mock.calls[0]?.[0].key).toBe(formSubmitGrantKey(formId));
  });

  test('stores custom post form grants for forms opened by a hook form submit', async () => {
    const hookFormId = 'form.hook.test-hook.0';
    const onSubmit = vi.fn((_ev, context) => {
      context.ui.showForm('form.0' as FormKey);
    });
    mockFormDefinitions({ [hookFormId]: onSubmit, 'form.0': vi.fn() });
    const redisPlugin = mockRedisPlugin({
      [formSubmitGrantKey(hookFormId)]: JSON.stringify({
        openedAt: 123,
      }),
    });

    const handleUIEvent = registerHandleUIEvent();

    await handleUIEvent(
      {
        state: {
          __postData: {
            thingId,
          },
        },
        event: {
          hook: 'test-hook',
          formSubmitted: {
            formId: hookFormId,
            results: {},
          },
        },
      },
      makeMetadata()
    );

    const setArg = redisPlugin.Set.mock.calls[0]?.[0];
    expect(setArg.key).toBe(formSubmitGrantKey('form.0'));
    expect(JSON.parse(setArg.value)).toEqual({
      openedAt: expect.any(Number),
    });
    expect(setArg.expiration).toBeGreaterThan(0);
    expect(redisPlugin.Expire).not.toHaveBeenCalled();
  });

  test('stores custom post form grants for forms opened by a granted root form submit', async () => {
    const onSubmit = vi.fn((_ev, context) => {
      context.ui.showForm('form.1' as FormKey);
    });
    mockFormDefinitions({ 'form.0': onSubmit, 'form.1': vi.fn() });
    const redisPlugin = mockRedisPlugin({
      [formSubmitGrantKey('form.0')]: JSON.stringify({
        openedAt: 123,
      }),
    });

    const handleUIEvent = registerHandleUIEvent();

    await handleUIEvent(
      {
        state: {
          __postData: {
            thingId,
          },
        },
        event: {
          formSubmitted: {
            formId: 'form.0',
            results: {},
          },
        },
      },
      makeMetadata()
    );

    const setArg = redisPlugin.Set.mock.calls[0]?.[0];
    expect(setArg.key).toBe(formSubmitGrantKey('form.1'));
    expect(JSON.parse(setArg.value)).toEqual({
      openedAt: expect.any(Number),
    });
    expect(setArg.expiration).toBeGreaterThan(0);
    expect(redisPlugin.Expire).not.toHaveBeenCalled();
  });

  test('rejects a context action submit for a form without a matching grant', async () => {
    const onSubmit = vi.fn();
    mockFormDefinitions({ 'form.1': onSubmit });
    mockRedisPlugin({
      [formSubmitGrantKey('form.0')]: JSON.stringify({
        openedAt: 123,
      }),
    });
    vi.spyOn(Devvit, 'menuItems', 'get').mockReturnValue([
      {
        label: 'Public action',
        location: 'post',
        onPress: vi.fn(),
      } as MenuItem,
    ]);

    const handleUIEvent = registerHandleUIEvent();

    await expect(handleUIEvent(makeHandleUIEventRequest('form.1'), makeMetadata())).rejects.toThrow(
      'Form form.1 was not opened by this user in this subreddit'
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('context action form submit grants', () => {
  test('stores the form ids opened by an upstream-authorized context action', async () => {
    const onPress = vi.fn((_ev, context) => {
      context.ui.showForm('form.0' as FormKey);
      context.ui.showForm('form.0' as FormKey);
    });
    mockFormDefinitions({ 'form.0': vi.fn() });
    vi.spyOn(Devvit, 'menuItems', 'get').mockReturnValue([
      {
        label: 'Public action',
        location: 'post',
        onPress,
      } as MenuItem,
    ]);
    const redisPlugin = mockRedisPlugin();
    const onAction = registerOnAction();

    await onAction(makeContextActionRequest(), makeMetadata());

    expect(onPress).toHaveBeenCalledOnce();
    expect(redisPlugin.Set).toHaveBeenCalledTimes(1);
    const setArg = redisPlugin.Set.mock.calls[0]?.[0];
    expect(setArg.key).toBe(formSubmitGrantKey('form.0'));
    expect(setArg.expiration).toBeGreaterThan(0);
    expect(JSON.parse(setArg.value)).toEqual({
      openedAt: expect.any(Number),
    });
    expect(redisPlugin.Expire).not.toHaveBeenCalled();
  });

  test('does not locally reject moderator-only context actions that reach app code', async () => {
    const onPress = vi.fn((_ev, context) => {
      context.ui.showForm('form.0' as FormKey);
    });
    mockFormDefinitions({ 'form.0': vi.fn() });
    vi.spyOn(Devvit, 'menuItems', 'get').mockReturnValue([
      {
        label: 'Mod action',
        location: 'post',
        forUserType: ['moderator'],
        onPress,
      } as MenuItem,
    ]);
    const redisPlugin = mockRedisPlugin();
    const onAction = registerOnAction();

    await expect(onAction(makeContextActionRequest(), makeMetadata())).resolves.toBeDefined();

    expect(onPress).toHaveBeenCalledOnce();
    expect(redisPlugin.Set.mock.calls[0]?.[0].key).toBe(formSubmitGrantKey('form.0'));
  });
});

describe('form submit grants', () => {
  test('stores deduped form grants with a short TTL', async () => {
    const context = makeContext();

    await addFormSubmitGrants(context, ['form.0', 'form.0', 'form.1']);

    expect(context.redis.set).toHaveBeenCalledTimes(2);
    expect(context.redis.set).toHaveBeenCalledWith(
      formSubmitGrantKey('form.0'),
      expect.any(String),
      { expiration: expect.any(Date) }
    );
    expect(context.redis.set).toHaveBeenCalledWith(
      formSubmitGrantKey('form.1'),
      expect.any(String),
      { expiration: expect.any(Date) }
    );
    expect(context.redis.expire).not.toHaveBeenCalled();
  });

  test('validates only forms with a matching grant', async () => {
    const context = makeContext({
      redisValues: {
        [formSubmitGrantKey('form.0')]: JSON.stringify({
          openedAt: 123,
        }),
      },
    });

    await expect(validateFormSubmitGrant(context, 'form.0')).resolves.toBeUndefined();
    await expect(validateFormSubmitGrant(context, 'form.1')).rejects.toThrow(
      'Form form.1 was not opened by this user in this subreddit'
    );
  });

  test('treats matching grants as sufficient for submit', async () => {
    const context = makeContext({
      redisValues: {
        [formSubmitGrantKey('form.0')]: JSON.stringify({
          openedAt: 123,
        }),
      },
    });

    await expect(validateFormSubmitGrant(context, 'form.0')).resolves.toBeUndefined();
  });
});
