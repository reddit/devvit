import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type { WebViewInternalEventMessage } from '@devvit/protos/json/devvit/ui/events/v1alpha/web_view.js';
import { emitEffectWithResponse } from '@devvit/shared-types/client/emit-effect.js';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  basicFormDefinition,
  complexFormDefinition,
  expectedShowFormMessage,
} from './helpers/test-helpers.js';
import { showForm } from './show-form.js';

const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  parent: {
    postMessage: vi.fn(),
  },
};
vi.stubGlobal('window', mockWindow);

vi.mock('@devvit/shared-types/client/emit-effect.js', () => ({
  emitEffectWithResponse: vi.fn(),
}));

describe('showForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle a form submitted with basic fields', async () => {
    const mockResponse: Partial<WebViewInternalEventMessage> = {
      formSubmitted: {
        results: {
          username: {
            fieldType: 0,
            stringValue: 'testuser',
          },
        },
      },
    };

    (emitEffectWithResponse as unknown as Mock).mockResolvedValueOnce(mockResponse);

    const result = await showForm(basicFormDefinition);

    expect(emitEffectWithResponse).toHaveBeenCalledWith({
      showForm: {
        form: {
          id: expect.stringMatching(/^form\.\d+$/),
          title: basicFormDefinition.title,
          shortDescription: basicFormDefinition.description,
          acceptLabel: basicFormDefinition.acceptLabel,
          cancelLabel: basicFormDefinition.cancelLabel,
          fields: [
            {
              fieldId: 'username',
              fieldType: 0,
              label: 'Username',
              defaultValue: {
                fieldType: 0,
                stringValue: undefined,
              },
              fieldConfig: {
                stringConfig: {
                  placeholder: undefined,
                },
              },
              disabled: undefined,
              helpText: undefined,
              isSecret: undefined,
              required: undefined,
            },
          ],
        },
      },
      type: 3 satisfies EffectType.EFFECT_SHOW_FORM,
    });

    expect(result).toStrictEqual({
      action: 'SUBMITTED',
      values: {
        username: 'testuser',
      },
    });
  });

  it('should handle form cancellation', async () => {
    (emitEffectWithResponse as unknown as Mock).mockResolvedValueOnce(null);

    const result = await showForm(basicFormDefinition);

    expect(result).toStrictEqual({
      action: 'CANCELED',
    });
  });

  it('should handle form submitted with multiple field types', async () => {
    const mockResponse: Partial<WebViewInternalEventMessage> = {
      formSubmitted: {
        results: {
          name: {
            fieldType: 0,
            stringValue: 'John Doe',
          },
          age: {
            fieldType: 2,
            numberValue: 30,
          },
          color: {
            fieldType: 5,
            selectionValue: {
              values: ['blue'],
            },
          },
        },
      },
    };

    (emitEffectWithResponse as unknown as Mock).mockResolvedValueOnce(mockResponse);

    const result = await showForm(complexFormDefinition);

    expect(emitEffectWithResponse).toHaveBeenCalledWith(
      expectedShowFormMessage(complexFormDefinition)
    );

    expect(result).toStrictEqual({
      action: 'SUBMITTED',
      values: {
        name: 'John Doe',
        age: 30,
        color: ['blue'],
      },
    });
  });
});
