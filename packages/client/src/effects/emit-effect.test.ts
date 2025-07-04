// @vitest-environment jsdom

import type { Effect, EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import type { FormSubmittedEvent } from '@devvit/protos/types/devvit/ui/effects/v1alpha/show_form.js';
import type { WebViewInternalMessageScope } from '@devvit/protos/types/devvit/ui/effects/web_view/v1alpha/post_message.js';
import { WebViewInternalEventMessage } from '@devvit/protos/types/devvit/ui/events/v1alpha/web_view.js';
import { FormFieldType } from '@devvit/protos/types/devvit/ui/form_builder/v1alpha/type.js';
import type { FormFieldValue } from '@devvit/protos/types/devvit/ui/form_builder/v1alpha/value.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { emitEffect } from './emit-effect.js';

describe('emit-effect', () => {
  let originalParent: Window | null;
  let mockParent: Window;

  beforeEach(() => {
    originalParent = window.parent;
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
    const effect: Effect = {
      type: 3 satisfies EffectType.EFFECT_SHOW_FORM,
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
    expect(postedMessage).toEqual({
      scope: 0 satisfies WebViewInternalMessageScope.CLIENT,
      type: 'devvit-internal',
      effect,
      id: expect.any(String),
    });
    expect((mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][1]).toBe('*');

    // Create mock response
    const messageData = {
      id: postedMessage.id,
      formSubmitted: {
        results: {
          field1: { fieldType: 0, stringValue: 'value1' },
        },
      },
    };
    const responsePayload = WebViewInternalEventMessage.fromJSON(messageData);

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: messageData,
        },
      })
    );

    const response = await messagePromise;
    expect(response).toStrictEqual(responsePayload);
  });

  it('should include message ID only for effects that require response', async () => {
    const effectWithResponse: Effect = {
      type: 3 satisfies EffectType.EFFECT_SHOW_FORM,
      showForm: {
        form: {
          fields: [],
          id: 'form.1',
          title: 'test-form',
        },
      },
    };
    const effectWithoutResponse: Effect = {
      type: 4 satisfies EffectType.EFFECT_SHOW_TOAST,
      showToast: {
        toast: { text: 'Test toast' },
      },
    };

    // Test effect with response
    const promiseWithResponse = emitEffect(effectWithResponse);
    const messageWithId = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(messageWithId.id).toBeDefined();
    expect(typeof messageWithId.id).toBe('string');
    expect(messageWithId.effect).toEqual(effectWithResponse);

    const mockResponse: WebViewInternalEventMessage = {
      id: messageWithId.id,
      formSubmitted: { results: {} },
    };
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'devvit-message', data: mockResponse },
      })
    );
    await promiseWithResponse;

    // Test effect without response
    const promiseWithoutResponse = emitEffect(effectWithoutResponse);
    const messageWithoutId = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[1][0];
    expect(messageWithoutId.id).toBeUndefined();
    expect(messageWithoutId.effect).toEqual(effectWithoutResponse);

    const result = await promiseWithoutResponse;
    expect(result).toBeUndefined();
  });

  it('should only handle response messages with the correct ID', async () => {
    const effect: Effect = {
      type: 3 satisfies EffectType.EFFECT_SHOW_FORM,
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
          field: { fieldType: 0, stringValue: 'wrong' },
        },
      },
    };
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: wrongMessage,
        },
      })
    );

    await new Promise(process.nextTick);

    // Create a message payload that matches the structure that would come from the server
    const correctMessageData = {
      id: postedMessage.id,
      formSubmitted: {
        results: {
          field: { fieldType: 0, stringValue: 'correct' },
        },
      },
    };

    const correctResponsePayload = WebViewInternalEventMessage.fromJSON(correctMessageData);

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: correctMessageData,
        },
      })
    );

    const response = await messagePromise;

    // Compare individual fields first
    expect(response?.id).toBe(correctResponsePayload.id);
    expect(response?.formSubmitted).toEqual(correctResponsePayload.formSubmitted);

    // Then do the full comparison
    expect(response).toStrictEqual(correctResponsePayload);
  });

  it('should ignore non-devvit messages', async () => {
    const effect: Effect = {
      type: 3 satisfies EffectType.EFFECT_SHOW_FORM,
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
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'other-message',
          data: {
            id: postedMessage.id,
            formSubmitted: {
              results: {
                field: { fieldType: 0, stringValue: 'irrelevant' },
              },
            },
          },
        },
      })
    );

    await new Promise(process.nextTick);

    // Now dispatch a proper devvit message
    const correctMessageData = {
      id: postedMessage.id,
      formSubmitted: {
        results: {
          field: { fieldType: 0, stringValue: 'correct' },
        },
      },
    };
    const correctResponsePayload = WebViewInternalEventMessage.fromJSON(correctMessageData);

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'devvit-message',
          data: correctMessageData,
        },
      })
    );

    const response = await messagePromise;
    expect(response).toStrictEqual(correctResponsePayload);
  });

  it('should clean up its specific event listener after receiving a response', async () => {
    const effect: Effect = { type: 3 satisfies EffectType.EFFECT_SHOW_FORM };
    const messagePromise = emitEffect(effect);

    expect(mockParent.postMessage).toHaveBeenCalledTimes(1);
    const postedMessage = (mockParent.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0];

    const handleMessageSpy = vi.fn();
    window.addEventListener('message', handleMessageSpy);

    const correctFormResults: { [key: string]: FormFieldValue } = {
      field: { fieldType: 0 satisfies FormFieldType.STRING, stringValue: 'correct' },
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
    window.dispatchEvent(messageEvent);

    await messagePromise;

    expect(handleMessageSpy).toHaveBeenCalledTimes(1);
    expect(handleMessageSpy).toHaveBeenCalledWith(messageEvent);

    window.dispatchEvent(messageEvent);

    expect(handleMessageSpy).toHaveBeenCalledTimes(2);
    window.removeEventListener('message', handleMessageSpy);
  });
});
