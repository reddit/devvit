import { NutritionCategory } from '@devvit/protos/json/devvit/dev_portal/nutrition/nutrition.js';
// eslint-disable-next-line no-restricted-imports
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
// eslint-disable-next-line no-restricted-imports
import type { LinkedBundle } from '@devvit/protos/types/devvit/runtime/bundle.js';
import { expect, test } from 'vitest';

import {
  appCapabilitiesFromActor,
  appCapabilitiesFromBundle,
  appCapabilitiesFromLinkedBundle,
} from './AppCapabilities.js';

const MODMAIL_ACTOR = 'devvit.actor.automation.v1alpha.OnModMail';

const ACTORS = [
  'devvit.actor.reddit.ContextAction',
  'devvit.actor.scheduler.SchedulerHandler',
  'devvit.reddit.custom_post.v1alpha.CustomPost',
  'devvit.ui.events.v1alpha.UIEventHandler',
  'devvit.actor.settings.v1alpha.InstallationSettings',
  'devvit.actor.automation.v1alpha.OnAppInstall',
  'devvit.actor.automation.v1alpha.OnAppUpgrade',
  'devvit.actor.automation.v1alpha.OnCommentCreate',
  'devvit.actor.automation.v1alpha.OnCommentDelete',
  'devvit.actor.automation.v1alpha.OnCommentReport',
  'devvit.actor.automation.v1alpha.OnCommentSubmit',
  'devvit.actor.automation.v1alpha.OnCommentUpdate',
  'devvit.actor.automation.v1alpha.OnModAction',
  MODMAIL_ACTOR,
  'devvit.actor.automation.v1alpha.OnPostCreate',
  'devvit.actor.automation.v1alpha.OnPostDelete',
  'devvit.actor.automation.v1alpha.OnPostFlairUpdate',
  'devvit.actor.automation.v1alpha.OnPostReport',
  'devvit.actor.automation.v1alpha.OnPostSubmit',
  'devvit.actor.automation.v1alpha.OnPostUpdate',
];
const PLUGINS = [
  'devvit.plugin.externalendpoints.v1alpha.ExternalEndpoints',
  'devvit.plugin.http.HTTP',
  'devvit.plugin.kvstore.KVStore',
  'devvit.plugin.redis.RedisAPI',
  'devvit.plugin.media.MediaService',
  'devvit.plugin.redditapi.flair.Flair',
  'devvit.plugin.redditapi.graphql.GraphQL',
  'devvit.plugin.redditapi.linksandcomments.LinksAndComments',
  'devvit.plugin.redditapi.listings.Listings',
  'devvit.plugin.redditapi.moderation.Moderation',
  'devvit.plugin.redditapi.modnote.ModNote',
  'devvit.plugin.redditapi.newmodmail.NewModmail',
  'devvit.plugin.redditapi.privatemessages.PrivateMessages',
  'devvit.plugin.redditapi.subreddits.Subreddits',
  'devvit.plugin.redditapi.users.Users',
  'devvit.plugin.redditapi.widgets.Widgets',
  'devvit.plugin.redditapi.wiki.Wiki',
  'devvit.plugin.scheduler.Scheduler',
  'devvit.plugin.settings.v1alpha.Settings',
  'devvit.plugin.payments.v1alpha.PaymentsService',
];

describe(appCapabilitiesFromActor.name, () => {
  test('an actor with webview', async () => {
    expect(
      appCapabilitiesFromActor({
        actorPlugins: [],
        actorTypes: [],
        hasWebView: true,
      })
    ).toStrictEqual([NutritionCategory.MODERATOR, NutritionCategory.WEBVIEW]);
  });

  test('an actor with many types and plugins', async () => {
    expect(
      appCapabilitiesFromActor({
        actorPlugins: PLUGINS.map((fullname) => ({ fullname })),
        actorTypes: ACTORS.map((name) => ({ name })),
        hasWebView: false,
      })
    ).toStrictEqual([
      NutritionCategory.UI,
      NutritionCategory.SCHEDULER,
      NutritionCategory.CUSTOM_POST,
      NutritionCategory.DATA,
      NutritionCategory.APP_TRIGGERS,
      NutritionCategory.REDDIT_TRIGGERS,
      NutritionCategory.EXTERNAL_ENDPOINTS,
      NutritionCategory.HTTP,
      NutritionCategory.REDDIT_API,
      NutritionCategory.PAYMENTS,
      NutritionCategory.MODERATOR,
    ]);
  });

  test('an actor with the telemetry plugin', async () => {
    expect(
      appCapabilitiesFromActor({
        actorPlugins: [{ fullname: 'devvit.plugin.telemetry.TelemetryPlugin' }],
        actorTypes: [],
        hasWebView: false,
      })
    ).toStrictEqual([NutritionCategory.JOURNEYS, NutritionCategory.MODERATOR]);
  });
});

describe(appCapabilitiesFromLinkedBundle.name, () => {
  const baseLinkedBundle: LinkedBundle = {
    code: '',
    hostname: '',
    provides: [],
    uses: [],
    assets: {},
    webviewAssets: {},
    products: {},
  };

  const baseActorDefinition: LinkedBundle['provides'][number] = {
    fullName: '',
    methods: [],
    name: '',
    version: '',
  };

  test('a linked bundle with no provides and only a webview asset resolver with assets', async () => {
    const bundle: LinkedBundle = {
      ...baseLinkedBundle,
      webviewAssets: { 'foo.gif': 'f4e3cc03-667b-4ab5-9e99-0c030c5648af' },
    };

    expect(appCapabilitiesFromLinkedBundle(bundle)).toStrictEqual([
      NutritionCategory.MODERATOR,
      NutritionCategory.WEBVIEW,
    ]);
  });

  test('a linked bundle with many provides and uses', async () => {
    const bundle: LinkedBundle = {
      ...baseLinkedBundle,
      provides: ACTORS.map((fullName) => ({ ...baseActorDefinition, fullName })),
      uses: PLUGINS.map((fullName) => ({
        ...baseLinkedBundle,
        provides: [{ ...baseActorDefinition, fullName }],
      })),
    };

    expect(appCapabilitiesFromLinkedBundle(bundle)).toStrictEqual([
      NutritionCategory.UI,
      NutritionCategory.SCHEDULER,
      NutritionCategory.CUSTOM_POST,
      NutritionCategory.DATA,
      NutritionCategory.APP_TRIGGERS,
      NutritionCategory.REDDIT_TRIGGERS,
      NutritionCategory.EXTERNAL_ENDPOINTS,
      NutritionCategory.HTTP,
      NutritionCategory.REDDIT_API,
      NutritionCategory.PAYMENTS,
      NutritionCategory.MODERATOR,
    ]);
  });

  test('a linked bundle using the telemetry plugin', async () => {
    const bundle: LinkedBundle = {
      ...baseLinkedBundle,
      uses: [
        {
          ...baseLinkedBundle,
          provides: [
            {
              ...baseActorDefinition,
              fullName: 'devvit.plugin.telemetry.TelemetryPlugin',
            },
          ],
        },
      ],
    };

    expect(appCapabilitiesFromLinkedBundle(bundle)).toStrictEqual([
      NutritionCategory.JOURNEYS,
      NutritionCategory.MODERATOR,
    ]);
  });
});

describe(appCapabilitiesFromBundle.name, () => {
  const baseDependencies: Bundle['dependencies'] = {
    actor: {
      name: 'main',
      owner: 'snoo',
      version: '0.0.0',
    },
    hostname: 'main.local',
    provides: [],
    uses: [],
    permissions: [],
  };

  const baseBundle: Bundle = {
    code: '',
    dependencies: {
      ...baseDependencies,
    },
    assetIds: {},
    webviewAssetIds: {},
  };

  const basePlugin: NonNullable<Bundle['dependencies']>['uses'][number] = {
    name: 'default',
    owner: '',
    typeName: '',
  };

  const baseActorDefinition: NonNullable<Bundle['dependencies']>['provides'][number]['definition'] =
    {
      fullName: '',
      methods: [],
      name: '',
      version: '',
    };

  test('a bundle with many provides and uses', async () => {
    const bundle: Bundle = {
      ...baseBundle,
      dependencies: {
        ...baseDependencies,
        provides: ACTORS.map((fullName) => ({
          definition: { ...baseActorDefinition, fullName },
          partitionsBy: [],
        })),
        uses: PLUGINS.map((typeName) => ({ ...basePlugin, typeName })),
      },
      assetIds: {},
      webviewAssetIds: {},
    };

    expect(appCapabilitiesFromBundle(bundle)).toStrictEqual([
      NutritionCategory.UI,
      NutritionCategory.SCHEDULER,
      NutritionCategory.CUSTOM_POST,
      NutritionCategory.DATA,
      NutritionCategory.APP_TRIGGERS,
      NutritionCategory.REDDIT_TRIGGERS,
      NutritionCategory.EXTERNAL_ENDPOINTS,
      NutritionCategory.HTTP,
      NutritionCategory.REDDIT_API,
      NutritionCategory.PAYMENTS,
      NutritionCategory.MODERATOR,
    ]);
  });

  test('a bundle using the telemetry plugin', async () => {
    const bundle: Bundle = {
      ...baseBundle,
      dependencies: {
        ...baseDependencies,
        uses: [
          {
            ...basePlugin,
            typeName: 'devvit.plugin.telemetry.TelemetryPlugin',
          },
        ],
      },
    };

    expect(appCapabilitiesFromBundle(bundle)).toStrictEqual([
      NutritionCategory.JOURNEYS,
      NutritionCategory.MODERATOR,
    ]);
  });
});
