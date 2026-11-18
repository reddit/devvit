import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { ShowWebViewEffect_Presentation } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/show_web_view.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
import type { Config } from '@devvit/shared-types/Config.js';
import { Header } from '@devvit/shared-types/Header.js';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Devvit } from '../../devvit/Devvit.js';
import { registerMenuItems } from '../../devvit/internals/menu-items.js';
import { UIClient } from './UIClient.js';

type RegisteredContextAction = {
  OnAction: (
    req: { actionId: string; subreddit?: { id: string } },
    metadata: Metadata
  ) => Promise<{
    effects: {
      type: EffectType;
      showWebView?: {
        intent?: { entrypointName: string };
        presentation: ShowWebViewEffect_Presentation;
      };
    }[];
  }>;
};

function makeMetadata(): Metadata {
  return {
    [Header.User]: { values: ['t2_user'] },
    [Header.Subreddit]: { values: ['t5_subreddit'] },
    [Header.SubredditName]: { values: ['test_subreddit'] },
    [Header.AppUser]: { values: ['t2_app_user'] },
  };
}

function registerOnAction(): RegisteredContextAction['OnAction'] {
  registerMenuItems({ provides: vi.fn() } as unknown as Config);
  return (Devvit as unknown as { prototype: RegisteredContextAction }).prototype.OnAction;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('UIClient.showWebViewInternal', () => {
  test.each([
    { presentation: 'modal' as const, expected: ShowWebViewEffect_Presentation.MODAL },
    { presentation: 'fullscreen' as const, expected: ShowWebViewEffect_Presentation.FULLSCREEN },
  ])('emits a $presentation showWebView intent', ({ presentation, expected }) => {
    const ui = new UIClient();

    ui.showWebViewInternal('settings', presentation);

    expect(ui.__effects).toEqual([
      {
        type: EffectType.EFFECT_SHOW_WEB_VIEW,
        showWebView: {
          intent: { entrypointName: 'settings' },
          presentation: expected,
        },
      },
    ]);
  });

  test('menu item onPress returns the intent in the context action response', async () => {
    const registeredActionId = `menuItem.${Devvit.menuItems.length}`;
    Devvit.addMenuItem({
      label: 'Open settings',
      location: 'subreddit',
      onPress: (_event, context) => {
        context.ui.showWebViewInternal('default', 'modal');
      },
    });

    const response = await registerOnAction()(
      { actionId: registeredActionId, subreddit: { id: 'subreddit' } },
      makeMetadata()
    );

    expect(response.effects).toHaveLength(1);
    expect(response.effects[0]).toMatchObject({
      type: EffectType.EFFECT_SHOW_WEB_VIEW,
      showWebView: {
        intent: { entrypointName: 'default' },
        presentation: ShowWebViewEffect_Presentation.MODAL,
      },
    });
  });
});
