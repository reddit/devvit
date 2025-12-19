// @vitest-environment jsdom

import type { FormSubmittedEvent } from '@devvit/protos/json/devvit/ui/effect_types/v1alpha/show_form.js';
import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import {
  type WebViewInternalMessage,
  WebViewInternalMessageScope,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/post_message.js';
import type { WebViewInternalEventMessage } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import { FormFieldType } from '@devvit/protos/json/devvit/ui/form_builder/v1alpha/type.js';
import type { FormFieldValue } from '@devvit/protos/json/devvit/ui/form_builder/v1alpha/value.js';
import { ConsentStatus } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Effect, emitEffect, webViewInternalMessageType } from './emit-effect.js';

describe('emit-effect', () => {
  let originalParent: Window | null;
  let mockParent: Window;

  beforeEach(() => {
    originalParent = parent;
    mockParent = {
      postMessage: vi.fn(),
    } as unknown as Window;
    Object.defineProperty(window, 'parent', {
      value: mockParent,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'parent', {
      value: originalParent,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('should post message to parent window and resolve on response', async () => {
    const showForm = {
      form: {
        fields: [],
        id: 'form.1',
        title: 'test-form',
      },
    };
    const effect: Effect = {
      type: EffectType.EFFECT_SHOW_FORM,
      showForm,
    };

    const messagePromise = emitEffect(effect);

    expect(mockParent.postMessage).toHaveBeenCalledTimes(1);
    const postedMessage = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(postedMessage).toStrictEqual({
      realtimeEffect: undefined,
      scope: WebViewInternalMessageScope.CLIENT,
      type: webViewInternalMessageType,
      effect,
      showForm,
      id: expect.any(String),
    });
    expect((mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][1]).toBe('*');

    // Create mock response
    const messageData: WebViewInternalEventMessage = {
      id: postedMessage.id,
      formSubmitted: {
        results: {
          field1: { fieldType: FormFieldType.STRING, stringValue: 'value1' },
        },
      },
    };

    dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: messageData,
        },
      })
    );

    const response = await messagePromise;
    expect(response).toStrictEqual<WebViewInternalEventMessage>({
      consentStatus: undefined,
      formCanceled: undefined,
      formSubmitted: {
        formId: undefined,
        results: {
          field1: {
            boolValue: undefined,
            fieldType: FormFieldType.STRING,
            groupValue: undefined,
            isSecret: undefined,
            listValue: undefined,
            numberValue: undefined,
            selectionValue: undefined,
            stringValue: 'value1',
          },
        },
      },
      id: postedMessage.id,
      immersiveModeEvent: undefined,
      orderResult: undefined,
      realtimeEvent: undefined,
      updateRequestContext: undefined,
    });
  });

  it('should include message ID only for effects that require response', async () => {
    const effectWithResponse: Effect = {
      type: EffectType.EFFECT_SHOW_FORM,
      showForm: {
        form: {
          fields: [],
          id: 'form.1',
          title: 'test-form',
        },
      },
    };
    const effectWithoutResponse: Effect = {
      type: EffectType.EFFECT_SHOW_TOAST,
      showToast: {
        toast: { text: 'Test toast' },
      },
    };

    // Test effect with response
    const promiseWithResponse = emitEffect(effectWithResponse);
    const messageWithId = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(messageWithId.id).toBeDefined();
    expect(typeof messageWithId.id).toBe('string');
    expect(messageWithId.effect).toStrictEqual(effectWithResponse);

    const mockResponse: WebViewInternalEventMessage = {
      id: messageWithId.id,
      formSubmitted: { results: {} },
    };
    dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'devvit-message', data: mockResponse },
      })
    );
    await promiseWithResponse;

    // Test effect without response
    const promiseWithoutResponse = emitEffect(effectWithoutResponse);
    const messageWithoutId = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[1][0];
    expect(messageWithoutId.id).toBeUndefined();
    expect(messageWithoutId.effect).toStrictEqual(effectWithoutResponse);

    const result = await promiseWithoutResponse;
    expect(result).toBeUndefined();
  });

  it('should only handle response messages with the correct ID', async () => {
    const effect: Effect = {
      type: EffectType.EFFECT_SHOW_FORM,
      showForm: {
        form: {
          fields: [],
          id: 'form.1',
          title: 'test-form',
        },
      },
    };

    const messagePromise = emitEffect(effect);

    expect(mockParent.postMessage).toHaveBeenCalledTimes(1);
    const postedMessage = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];

    // First dispatch a message with wrong ID - should be ignored
    const wrongMessage = {
      id: 'wrong-id',
      formSubmitted: {
        results: {
          field: { fieldType: FormFieldType.STRING, stringValue: 'wrong' },
        },
      },
    };
    dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: wrongMessage,
        },
      })
    );

    await new Promise(process.nextTick);

    // Create a message payload that matches the structure that would come from the server
    const correctMessageData: WebViewInternalEventMessage = {
      id: postedMessage.id,
      formSubmitted: {
        results: {
          field: { fieldType: FormFieldType.STRING, stringValue: 'correct' },
        },
      },
    };

    dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: correctMessageData,
        },
      })
    );

    const response = await messagePromise;

    expect(response?.id).toBe(correctMessageData.id);
    expect(response?.formSubmitted).toEqual(correctMessageData.formSubmitted);
    expect(response).toStrictEqual<WebViewInternalEventMessage>({
      consentStatus: undefined,
      formCanceled: undefined,
      formSubmitted: {
        formId: undefined,
        results: {
          field: {
            boolValue: undefined,
            fieldType: FormFieldType.STRING,
            groupValue: undefined,
            isSecret: undefined,
            listValue: undefined,
            numberValue: undefined,
            selectionValue: undefined,
            stringValue: 'correct',
          },
        },
      },
      id: correctMessageData.id,
      immersiveModeEvent: undefined,
      orderResult: undefined,
      realtimeEvent: undefined,
      updateRequestContext: undefined,
    });
  });

  it('should ignore non-devvit messages', async () => {
    const effect: Effect = {
      type: EffectType.EFFECT_SHOW_FORM,
      showForm: {
        form: {
          fields: [],
          id: 'form.1',
          title: 'test-form',
        },
      },
    };
    const messagePromise = emitEffect(effect);

    expect(mockParent.postMessage).toHaveBeenCalledTimes(1);
    const postedMessage = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];

    // First dispatch a non-devvit message - should be ignored
    dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'other-message',
          data: {
            id: postedMessage.id,
            formSubmitted: {
              results: {
                field: { fieldType: FormFieldType.STRING, stringValue: 'irrelevant' },
              },
            },
          },
        },
      })
    );

    await new Promise(process.nextTick);

    // Now dispatch a proper devvit message
    const correctMessageData: WebViewInternalEventMessage = {
      id: postedMessage.id,
      formSubmitted: {
        results: {
          field: { fieldType: FormFieldType.STRING, stringValue: 'correct' },
        },
      },
    };

    dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: correctMessageData,
        },
      })
    );

    const response = await messagePromise;
    expect(response).toStrictEqual<WebViewInternalEventMessage>({
      consentStatus: undefined,
      formCanceled: undefined,
      formSubmitted: {
        formId: undefined,
        results: {
          field: {
            boolValue: undefined,
            fieldType: FormFieldType.STRING,
            groupValue: undefined,
            isSecret: undefined,
            listValue: undefined,
            numberValue: undefined,
            selectionValue: undefined,
            stringValue: 'correct',
          },
        },
      },
      id: postedMessage.id,
      immersiveModeEvent: undefined,
      orderResult: undefined,
      realtimeEvent: undefined,
      updateRequestContext: undefined,
    });
  });

  it('should clean up its specific event listener after receiving a response', async () => {
    const effect: Effect = { type: EffectType.EFFECT_SHOW_FORM };
    const messagePromise = emitEffect(effect);

    expect(mockParent.postMessage).toHaveBeenCalledTimes(1);
    const postedMessage = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];

    const handleMessageSpy = vi.fn();
    addEventListener('message', handleMessageSpy);

    const correctFormResults: { [key: string]: FormFieldValue } = {
      field: {
        fieldType: FormFieldType.STRING,
        stringValue: 'correct',
      },
    };
    const correctFormResponse: FormSubmittedEvent = { results: correctFormResults };
    const correctResponsePayload: WebViewInternalEventMessage = {
      id: postedMessage.id,
      formSubmitted: correctFormResponse,
    };
    const messageEvent = new MessageEvent('message', {
      data: {
        type: 'devvit-message',
        data: correctResponsePayload,
      },
    });
    dispatchEvent(messageEvent);

    await messagePromise;

    expect(handleMessageSpy).toHaveBeenCalledTimes(1);
    expect(handleMessageSpy).toHaveBeenCalledWith(messageEvent);

    dispatchEvent(messageEvent);

    expect(handleMessageSpy).toHaveBeenCalledTimes(2);
    removeEventListener('message', handleMessageSpy);
  });

  it('should handle can run as user effect with response', async () => {
    const effect: Effect = {
      type: EffectType.EFFECT_CAN_RUN_AS_USER,
    };

    const messagePromise = emitEffect(effect);

    expect(mockParent.postMessage).toHaveBeenCalledTimes(1);
    const postedMessage = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(postedMessage).toStrictEqual({
      scope: WebViewInternalMessageScope.CLIENT,
      type: webViewInternalMessageType,
      effect,
      id: expect.any(String),
      realtimeEffect: undefined,
    });
    expect((mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][1]).toBe('*');

    const messageData: WebViewInternalEventMessage = {
      id: postedMessage.id,
      consentStatus: {
        consentStatus: ConsentStatus.GRANTED,
      },
    };

    dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: messageData,
        },
      })
    );

    const response = await messagePromise;
    expect(response).toStrictEqual<WebViewInternalEventMessage>({
      consentStatus: {
        consentStatus: ConsentStatus.GRANTED,
      },
      formCanceled: undefined,
      formSubmitted: undefined,
      id: messageData.id,
      immersiveModeEvent: undefined,
      orderResult: undefined,
      realtimeEvent: undefined,
      updateRequestContext: undefined,
    });
  });

  it('should include navigateToUrl effect in post message payload', () => {
    const navigateEffect: Effect = {
      type: EffectType.EFFECT_NAVIGATE_TO_URL,
      navigateToUrl: {
        url: 'https://www.reddit.com/r/test',
      },
    };

    emitEffect(navigateEffect);

    expect(mockParent.postMessage).toHaveBeenCalledTimes(1);
    const postedMessage = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(postedMessage).toMatchInlineSnapshot(`
      {
        "effect": {
          "navigateToUrl": {
            "url": "https://www.reddit.com/r/test",
          },
          "type": 5,
        },
        "navigateToUrl": {
          "url": "https://www.reddit.com/r/test",
        },
        "realtimeEffect": undefined,
        "scope": 0,
        "type": "devvit-internal",
      }
    `);
  });

  it('should include realtime subscriptions effect in post message payload', () => {
    const realtimeEffect: Effect = {
      type: EffectType.EFFECT_REALTIME_SUB,
      realtime: {
        subscriptionIds: ['channel1', 'channel2'],
      },
    };

    emitEffect(realtimeEffect);

    expect(mockParent.postMessage).toHaveBeenCalledTimes(1);
    const postedMessage = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(postedMessage).toMatchInlineSnapshot(`
      {
        "realtime": {
          "subscriptionIds": [
            "channel1",
            "channel2",
          ],
        },
        "realtimeEffect": {
          "subscriptionIds": [
            "channel1",
            "channel2",
          ],
        },
        "scope": 0,
        "type": "devvit-internal",
      }
    `);
  });

  it('should include canRunAsUser effect in post message payload', () => {
    const canRunAsUserEffect: Effect = {
      type: EffectType.EFFECT_CAN_RUN_AS_USER,
      canRunAsUser: {
        postId: 't3_post123',
      },
    };

    emitEffect(canRunAsUserEffect);

    expect(mockParent.postMessage).toHaveBeenCalledTimes(1);
    const postedMessage = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(postedMessage).toStrictEqual<WebViewInternalMessage>({
      canRunAsUser: {
        postId: 't3_post123',
      },
      effect: {
        canRunAsUser: {
          postId: 't3_post123',
        },
        type: EffectType.EFFECT_CAN_RUN_AS_USER,
      },
      id: expect.any(String),
      realtimeEffect: undefined,
      scope: 0,
      type: webViewInternalMessageType,
    });
  });
});
