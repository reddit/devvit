import { Scope } from '@devvit/protos';
import type { AppPermissionConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
import { test } from 'vitest';

import { createDependencySpec } from './dependency-spec-util.js';

const allPermissions: Readonly<AppPermissionConfig> = {
  http: { enable: true, domains: ['example.com'] },
  media: true,
  menu: true,
  payments: true,
  realtime: true,
  redis: true,
  reddit: { enable: true, scope: 'user', asUser: [Scope.SUBMIT_POST] },
  settings: true,
  triggers: true,
};
const noPermissions: Readonly<AppPermissionConfig> = {
  http: { enable: false, domains: [] },
  media: false,
  menu: false,
  payments: false,
  realtime: false,
  redis: false,
  reddit: { enable: false, scope: 'user', asUser: [] },
  settings: false,
  triggers: false,
};
const asUserPermissions: Readonly<AppPermissionConfig> = {
  http: { enable: false, domains: [] },
  media: false,
  menu: false,
  payments: false,
  realtime: false,
  redis: false,
  reddit: { enable: true, scope: 'user', asUser: [Scope.SUBMIT_POST] },
  settings: false,
  triggers: false,
};
const redditPermissionsWithoutAsUser: Readonly<AppPermissionConfig> = {
  http: { enable: false, domains: [] },
  media: false,
  menu: false,
  payments: false,
  realtime: false,
  redis: false,
  reddit: { enable: true, scope: 'user', asUser: [] },
  settings: false,
  triggers: false,
};

test('permissions', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        menu: { items: [] },
        permissions: allPermissions,
        settings: { global: {}, subreddit: {} },
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [
        {
          "asUserScopes": [
            1,
          ],
          "requestedFetchDomains": [
            "example.com",
          ],
        },
      ],
      "provides": [
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.payments.v1alpha.PaymentProcessor",
            "methods": [
              {
                "fullName": "/devvit.actor.payments.v1alpha.PaymentProcessor/FulfillOrder",
                "name": "FulfillOrder",
                "requestStream": false,
                "requestType": "devvit.actor.payments.v1alpha.FulfillOrderRequest",
                "responseStream": false,
                "responseType": "devvit.actor.payments.v1alpha.FulfillOrderResponse",
              },
              {
                "fullName": "/devvit.actor.payments.v1alpha.PaymentProcessor/RefundOrder",
                "name": "RefundOrder",
                "requestStream": false,
                "requestType": "devvit.actor.payments.v1alpha.RefundOrderRequest",
                "responseStream": false,
                "responseType": "devvit.actor.payments.v1alpha.RefundOrderResponse",
              },
            ],
            "name": "PaymentProcessor",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.reddit.ContextAction",
            "methods": [
              {
                "fullName": "/devvit.actor.reddit.ContextAction/GetActions",
                "name": "GetActions",
                "requestStream": false,
                "requestType": "google.protobuf.Empty",
                "responseStream": false,
                "responseType": "devvit.actor.reddit.ContextActionList",
              },
              {
                "fullName": "/devvit.actor.reddit.ContextAction/OnAction",
                "name": "OnAction",
                "requestStream": false,
                "requestType": "devvit.actor.reddit.ContextActionRequest",
                "responseStream": false,
                "responseType": "devvit.actor.reddit.ContextActionResponse",
              },
            ],
            "name": "ContextAction",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.settings.v1alpha.AppSettings",
            "methods": [
              {
                "fullName": "/devvit.actor.settings.v1alpha.AppSettings/GetAppSettingsFields",
                "name": "GetAppSettingsFields",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.GetFieldsRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.GetFieldsResponse",
              },
              {
                "fullName": "/devvit.actor.settings.v1alpha.AppSettings/ValidateAppForm",
                "name": "ValidateAppForm",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.ValidateFormRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.ValidateFormResponse",
              },
            ],
            "name": "AppSettings",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.settings.v1alpha.InstallationSettings",
            "methods": [
              {
                "fullName": "/devvit.actor.settings.v1alpha.InstallationSettings/GetSettingsFields",
                "name": "GetSettingsFields",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.GetFieldsRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.GetFieldsResponse",
              },
              {
                "fullName": "/devvit.actor.settings.v1alpha.InstallationSettings/ValidateForm",
                "name": "ValidateForm",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.ValidateFormRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.ValidateFormResponse",
              },
            ],
            "name": "InstallationSettings",
            "version": "",
          },
          "partitionsBy": [],
        },
      ],
      "uses": [
        {
          "name": "default",
          "typeName": "devvit.plugin.http.HTTP",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.media.MediaService",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.payments.v1alpha.PaymentsService",
        },
        {
          "name": "default",
          "typeName": "devvit.events.v1alpha.Realtime",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.flair.Flair",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.graphql.GraphQL",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.linksandcomments.LinksAndComments",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.listings.Listings",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.moderation.Moderation",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.modnote.ModNote",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.newmodmail.NewModmail",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.privatemessages.PrivateMessages",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.subreddits.Subreddits",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.users.Users",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.widgets.Widgets",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.wiki.Wiki",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.useractions.UserActions",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redis.RedisAPI",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.settings.v1alpha.Settings",
        },
      ],
    }
  `));

test('permissions', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        payments: {
          products: [],
          endpoints: {
            fulfillOrder: '/internal/payments/fulfill',
          },
        },
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [],
      "provides": [
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.payments.v1alpha.PaymentProcessor",
            "methods": [
              {
                "fullName": "/devvit.actor.payments.v1alpha.PaymentProcessor/FulfillOrder",
                "name": "FulfillOrder",
                "requestStream": false,
                "requestType": "devvit.actor.payments.v1alpha.FulfillOrderRequest",
                "responseStream": false,
                "responseType": "devvit.actor.payments.v1alpha.FulfillOrderResponse",
              },
              {
                "fullName": "/devvit.actor.payments.v1alpha.PaymentProcessor/RefundOrder",
                "name": "RefundOrder",
                "requestStream": false,
                "requestType": "devvit.actor.payments.v1alpha.RefundOrderRequest",
                "responseStream": false,
                "responseType": "devvit.actor.payments.v1alpha.RefundOrderResponse",
              },
            ],
            "name": "PaymentProcessor",
            "version": "",
          },
          "partitionsBy": [],
        },
      ],
      "uses": [
        {
          "name": "default",
          "typeName": "devvit.plugin.payments.v1alpha.PaymentsService",
        },
      ],
    }
  `));

test('post', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        post: {
          dir: 'dir',
          entrypoints: {
            default: {
              name: 'default',
              entry: 'entry',
              height: 'regular',
            },
          },
        },
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [],
      "provides": [
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.reddit.custom_post.v1alpha.CustomPost",
            "methods": [
              {
                "fullName": "/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPost",
                "name": "RenderPost",
                "requestStream": false,
                "requestType": "devvit.reddit.custom_post.v1alpha.RenderPostRequest",
                "responseStream": false,
                "responseType": "devvit.reddit.custom_post.v1alpha.RenderPostResponse",
              },
              {
                "fullName": "/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPostContent",
                "name": "RenderPostContent",
                "requestStream": false,
                "requestType": "devvit.ui.block_kit.v1beta.UIRequest",
                "responseStream": false,
                "responseType": "devvit.ui.block_kit.v1beta.UIResponse",
              },
              {
                "fullName": "/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPostComposer",
                "name": "RenderPostComposer",
                "requestStream": false,
                "requestType": "devvit.ui.block_kit.v1beta.UIRequest",
                "responseStream": false,
                "responseType": "devvit.ui.block_kit.v1beta.UIResponse",
              },
            ],
            "name": "CustomPost",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.ui.events.v1alpha.UIEventHandler",
            "methods": [
              {
                "fullName": "/devvit.ui.events.v1alpha.UIEventHandler/HandleUIEvent",
                "name": "HandleUIEvent",
                "requestStream": false,
                "requestType": "devvit.ui.events.v1alpha.HandleUIEventRequest",
                "responseStream": false,
                "responseType": "devvit.ui.events.v1alpha.HandleUIEventResponse",
              },
            ],
            "name": "UIEventHandler",
            "version": "",
          },
          "partitionsBy": [],
        },
      ],
      "uses": [],
    }
  `));

test('asUserPermissions', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: asUserPermissions,
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [
        {
          "asUserScopes": [
            1,
          ],
          "requestedFetchDomains": [],
        },
      ],
      "provides": [],
      "uses": [
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.flair.Flair",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.graphql.GraphQL",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.linksandcomments.LinksAndComments",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.listings.Listings",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.moderation.Moderation",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.modnote.ModNote",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.newmodmail.NewModmail",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.privatemessages.PrivateMessages",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.subreddits.Subreddits",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.users.Users",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.widgets.Widgets",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.wiki.Wiki",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.useractions.UserActions",
        },
      ],
    }
  `));

test('redditPermissionsWithoutAsUser', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: redditPermissionsWithoutAsUser,
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
      {
        "actor": {
          "name": "actor name",
          "owner": "actor owner",
          "version": "1.2.3",
        },
        "hostname": "actor name.hostname",
        "permissions": [],
        "provides": [],
        "uses": [
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.flair.Flair",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.graphql.GraphQL",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.linksandcomments.LinksAndComments",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.listings.Listings",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.moderation.Moderation",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.modnote.ModNote",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.newmodmail.NewModmail",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.privatemessages.PrivateMessages",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.subreddits.Subreddits",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.users.Users",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.widgets.Widgets",
          },
          {
            "name": "default",
            "typeName": "devvit.plugin.redditapi.wiki.Wiki",
          },
        ],
      }
    `));

test('server', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        server: { dir: 'dir', entry: 'entry' },
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [],
      "provides": [
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.webbit.WebbitServer",
            "methods": [
              {
                "fullName": "/devvit.actor.webbit.WebbitServer/Request",
                "name": "Request",
                "requestStream": false,
                "requestType": "devvit.actor.webbit.WebbitHttpRequest",
                "responseStream": false,
                "responseType": "devvit.actor.webbit.WebbitHttpResponse",
              },
            ],
            "name": "WebbitServer",
            "version": "",
          },
          "partitionsBy": [],
        },
      ],
      "uses": [],
    }
  `));

test('forms', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        forms: {
          myForm: '/internal/form/submitMyForm',
        },
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [],
      "provides": [
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.ui.events.v1alpha.UIEventHandler",
            "methods": [
              {
                "fullName": "/devvit.ui.events.v1alpha.UIEventHandler/HandleUIEvent",
                "name": "HandleUIEvent",
                "requestStream": false,
                "requestType": "devvit.ui.events.v1alpha.HandleUIEventRequest",
                "responseStream": false,
                "responseType": "devvit.ui.events.v1alpha.HandleUIEventResponse",
              },
            ],
            "name": "UIEventHandler",
            "version": "",
          },
          "partitionsBy": [],
        },
      ],
      "uses": [],
    }
  `));

test('settings', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        settings: { global: {}, subreddit: {} },
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [],
      "provides": [
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.settings.v1alpha.AppSettings",
            "methods": [
              {
                "fullName": "/devvit.actor.settings.v1alpha.AppSettings/GetAppSettingsFields",
                "name": "GetAppSettingsFields",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.GetFieldsRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.GetFieldsResponse",
              },
              {
                "fullName": "/devvit.actor.settings.v1alpha.AppSettings/ValidateAppForm",
                "name": "ValidateAppForm",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.ValidateFormRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.ValidateFormResponse",
              },
            ],
            "name": "AppSettings",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.settings.v1alpha.InstallationSettings",
            "methods": [
              {
                "fullName": "/devvit.actor.settings.v1alpha.InstallationSettings/GetSettingsFields",
                "name": "GetSettingsFields",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.GetFieldsRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.GetFieldsResponse",
              },
              {
                "fullName": "/devvit.actor.settings.v1alpha.InstallationSettings/ValidateForm",
                "name": "ValidateForm",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.ValidateFormRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.ValidateFormResponse",
              },
            ],
            "name": "InstallationSettings",
            "version": "",
          },
          "partitionsBy": [],
        },
      ],
      "uses": [
        {
          "name": "default",
          "typeName": "devvit.plugin.settings.v1alpha.Settings",
        },
      ],
    }
  `));

test('triggers', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        triggers: { onPostCreate: '/internal/on/post/create' },
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [],
      "provides": [
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostCreate",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostCreate/OnPostCreate",
                "name": "OnPostCreate",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostCreate",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostCreate",
            "version": "",
          },
          "partitionsBy": [],
        },
      ],
      "uses": [],
    }
  `));

test('blocks triggers', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: noPermissions,
        triggers: { onPostCreate: '' },
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [],
      "provides": [
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostCreate",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostCreate/OnPostCreate",
                "name": "OnPostCreate",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostCreate",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostCreate",
            "version": "",
          },
          "partitionsBy": [],
        },
      ],
      "uses": [],
    }
  `));

test('everything', () =>
  expect(
    createDependencySpec(
      { name: 'actor name', owner: 'actor owner', version: '1.2.3' },
      {
        schema: 'v1',
        name: 'name',
        permissions: allPermissions,
        post: {
          dir: 'dir',
          entrypoints: {
            default: {
              name: 'default',
              entry: 'entry',
              height: 'regular',
            },
          },
        },
        forms: {
          myForm: '/internal/form/submitMyForm',
        },
        server: { dir: 'dir', entry: 'entry' },
        dev: {},
        blocks: { entry: 'entry' },
        media: { dir: 'dir' },
        menu: { items: [] },
        scheduler: { tasks: {} },
        settings: {
          global: {},
          subreddit: {},
        },
        triggers: {
          onAppInstall: '/internal/onAppInstall',
          onAppUpgrade: '/internal/onAppUpgrade',
          onAutomoderatorFilterComment: '/internal/onAutomoderatorFilterComment',
          onAutomoderatorFilterPost: '/internal/onAutomoderatorFilterPost',
          onCommentCreate: '/internal/onCommentCreate',
          onCommentDelete: '/internal/onCommentDelete',
          onCommentReport: '/internal/onCommentReport',
          onCommentSubmit: '/internal/onCommentSubmit',
          onCommentUpdate: '/internal/onCommentUpdate',
          onModAction: '/internal/onModAction',
          onModMail: '/internal/onModMail',
          onPostCreate: '/internal/onPostCreate',
          onPostDelete: '/internal/onPostDelete',
          onPostFlairUpdate: '/internal/onPostFlairUpdate',
          onPostNsfwUpdate: '/internal/onPostNsfwUpdate',
          onPostReport: '/internal/onPostReport',
          onPostSpoilerUpdate: '/internal/onPostSpoilerUpdate',
          onPostSubmit: '/internal/onPostSubmit',
          onPostUpdate: '/internal/onPostUpdate',
        },
      },
      { hostname: 'hostname' }
    )
  ).toMatchInlineSnapshot(`
    {
      "actor": {
        "name": "actor name",
        "owner": "actor owner",
        "version": "1.2.3",
      },
      "hostname": "actor name.hostname",
      "permissions": [
        {
          "asUserScopes": [
            1,
          ],
          "requestedFetchDomains": [
            "example.com",
          ],
        },
      ],
      "provides": [
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.payments.v1alpha.PaymentProcessor",
            "methods": [
              {
                "fullName": "/devvit.actor.payments.v1alpha.PaymentProcessor/FulfillOrder",
                "name": "FulfillOrder",
                "requestStream": false,
                "requestType": "devvit.actor.payments.v1alpha.FulfillOrderRequest",
                "responseStream": false,
                "responseType": "devvit.actor.payments.v1alpha.FulfillOrderResponse",
              },
              {
                "fullName": "/devvit.actor.payments.v1alpha.PaymentProcessor/RefundOrder",
                "name": "RefundOrder",
                "requestStream": false,
                "requestType": "devvit.actor.payments.v1alpha.RefundOrderRequest",
                "responseStream": false,
                "responseType": "devvit.actor.payments.v1alpha.RefundOrderResponse",
              },
            ],
            "name": "PaymentProcessor",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.reddit.custom_post.v1alpha.CustomPost",
            "methods": [
              {
                "fullName": "/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPost",
                "name": "RenderPost",
                "requestStream": false,
                "requestType": "devvit.reddit.custom_post.v1alpha.RenderPostRequest",
                "responseStream": false,
                "responseType": "devvit.reddit.custom_post.v1alpha.RenderPostResponse",
              },
              {
                "fullName": "/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPostContent",
                "name": "RenderPostContent",
                "requestStream": false,
                "requestType": "devvit.ui.block_kit.v1beta.UIRequest",
                "responseStream": false,
                "responseType": "devvit.ui.block_kit.v1beta.UIResponse",
              },
              {
                "fullName": "/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPostComposer",
                "name": "RenderPostComposer",
                "requestStream": false,
                "requestType": "devvit.ui.block_kit.v1beta.UIRequest",
                "responseStream": false,
                "responseType": "devvit.ui.block_kit.v1beta.UIResponse",
              },
            ],
            "name": "CustomPost",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.ui.events.v1alpha.UIEventHandler",
            "methods": [
              {
                "fullName": "/devvit.ui.events.v1alpha.UIEventHandler/HandleUIEvent",
                "name": "HandleUIEvent",
                "requestStream": false,
                "requestType": "devvit.ui.events.v1alpha.HandleUIEventRequest",
                "responseStream": false,
                "responseType": "devvit.ui.events.v1alpha.HandleUIEventResponse",
              },
            ],
            "name": "UIEventHandler",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.webbit.WebbitServer",
            "methods": [
              {
                "fullName": "/devvit.actor.webbit.WebbitServer/Request",
                "name": "Request",
                "requestStream": false,
                "requestType": "devvit.actor.webbit.WebbitHttpRequest",
                "responseStream": false,
                "responseType": "devvit.actor.webbit.WebbitHttpResponse",
              },
            ],
            "name": "WebbitServer",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.reddit.ContextAction",
            "methods": [
              {
                "fullName": "/devvit.actor.reddit.ContextAction/GetActions",
                "name": "GetActions",
                "requestStream": false,
                "requestType": "google.protobuf.Empty",
                "responseStream": false,
                "responseType": "devvit.actor.reddit.ContextActionList",
              },
              {
                "fullName": "/devvit.actor.reddit.ContextAction/OnAction",
                "name": "OnAction",
                "requestStream": false,
                "requestType": "devvit.actor.reddit.ContextActionRequest",
                "responseStream": false,
                "responseType": "devvit.actor.reddit.ContextActionResponse",
              },
            ],
            "name": "ContextAction",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.scheduler.SchedulerHandler",
            "methods": [
              {
                "fullName": "/devvit.actor.scheduler.SchedulerHandler/HandleScheduledAction",
                "name": "HandleScheduledAction",
                "requestStream": false,
                "requestType": "devvit.actor.scheduler.ScheduledAction",
                "responseStream": false,
                "responseType": "google.protobuf.Empty",
              },
            ],
            "name": "SchedulerHandler",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnAppInstall",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnAppInstall/OnAppInstall",
                "name": "OnAppInstall",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.AppInstall",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnAppInstall",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnAppUpgrade",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnAppUpgrade/OnAppUpgrade",
                "name": "OnAppUpgrade",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.AppUpgrade",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnAppUpgrade",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnAutomoderatorFilterComment",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnAutomoderatorFilterComment/OnAutomoderatorFilterComment",
                "name": "OnAutomoderatorFilterComment",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.AutomoderatorFilterComment",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnAutomoderatorFilterComment",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnAutomoderatorFilterPost",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnAutomoderatorFilterPost/OnAutomoderatorFilterPost",
                "name": "OnAutomoderatorFilterPost",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.AutomoderatorFilterPost",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnAutomoderatorFilterPost",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnCommentCreate",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnCommentCreate/OnCommentCreate",
                "name": "OnCommentCreate",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.CommentCreate",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnCommentCreate",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnCommentDelete",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnCommentDelete/OnCommentDelete",
                "name": "OnCommentDelete",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.CommentDelete",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnCommentDelete",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnCommentReport",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnCommentReport/OnCommentReport",
                "name": "OnCommentReport",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.CommentReport",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnCommentReport",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnCommentSubmit",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnCommentSubmit/OnCommentSubmit",
                "name": "OnCommentSubmit",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.CommentSubmit",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnCommentSubmit",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnCommentUpdate",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnCommentUpdate/OnCommentUpdate",
                "name": "OnCommentUpdate",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.CommentUpdate",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnCommentUpdate",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnModAction",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnModAction/OnModAction",
                "name": "OnModAction",
                "requestStream": false,
                "requestType": "devvit.reddit.v2alpha.ModAction",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnModAction",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnModMail",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnModMail/OnModMail",
                "name": "OnModMail",
                "requestStream": false,
                "requestType": "devvit.reddit.v2alpha.ModMail",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnModMail",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostCreate",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostCreate/OnPostCreate",
                "name": "OnPostCreate",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostCreate",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostCreate",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostDelete",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostDelete/OnPostDelete",
                "name": "OnPostDelete",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostDelete",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostDelete",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostFlairUpdate",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostFlairUpdate/OnPostFlairUpdate",
                "name": "OnPostFlairUpdate",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostFlairUpdate",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostFlairUpdate",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostNsfwUpdate",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostNsfwUpdate/OnPostNsfwUpdate",
                "name": "OnPostNsfwUpdate",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostNsfwUpdate",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostNsfwUpdate",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostReport",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostReport/OnPostReport",
                "name": "OnPostReport",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostReport",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostReport",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostSpoilerUpdate",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostSpoilerUpdate/OnPostSpoilerUpdate",
                "name": "OnPostSpoilerUpdate",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostSpoilerUpdate",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostSpoilerUpdate",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostSubmit",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostSubmit/OnPostSubmit",
                "name": "OnPostSubmit",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostSubmit",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostSubmit",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.automation.v1alpha.OnPostUpdate",
            "methods": [
              {
                "fullName": "/devvit.actor.automation.v1alpha.OnPostUpdate/OnPostUpdate",
                "name": "OnPostUpdate",
                "requestStream": false,
                "requestType": "devvit.events.v1alpha.PostUpdate",
                "responseStream": false,
                "responseType": "devvit.actor.automation.v1alpha.HandlerResult",
              },
            ],
            "name": "OnPostUpdate",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.settings.v1alpha.AppSettings",
            "methods": [
              {
                "fullName": "/devvit.actor.settings.v1alpha.AppSettings/GetAppSettingsFields",
                "name": "GetAppSettingsFields",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.GetFieldsRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.GetFieldsResponse",
              },
              {
                "fullName": "/devvit.actor.settings.v1alpha.AppSettings/ValidateAppForm",
                "name": "ValidateAppForm",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.ValidateFormRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.ValidateFormResponse",
              },
            ],
            "name": "AppSettings",
            "version": "",
          },
          "partitionsBy": [],
        },
        {
          "actor": {
            "name": "actor name",
            "owner": "actor owner",
            "version": "1.2.3",
          },
          "definition": {
            "fullName": "devvit.actor.settings.v1alpha.InstallationSettings",
            "methods": [
              {
                "fullName": "/devvit.actor.settings.v1alpha.InstallationSettings/GetSettingsFields",
                "name": "GetSettingsFields",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.GetFieldsRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.GetFieldsResponse",
              },
              {
                "fullName": "/devvit.actor.settings.v1alpha.InstallationSettings/ValidateForm",
                "name": "ValidateForm",
                "requestStream": false,
                "requestType": "devvit.actor.settings.v1alpha.ValidateFormRequest",
                "responseStream": false,
                "responseType": "devvit.actor.settings.v1alpha.ValidateFormResponse",
              },
            ],
            "name": "InstallationSettings",
            "version": "",
          },
          "partitionsBy": [],
        },
      ],
      "uses": [
        {
          "name": "default",
          "typeName": "devvit.plugin.http.HTTP",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.media.MediaService",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.payments.v1alpha.PaymentsService",
        },
        {
          "name": "default",
          "typeName": "devvit.events.v1alpha.Realtime",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.flair.Flair",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.graphql.GraphQL",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.linksandcomments.LinksAndComments",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.listings.Listings",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.moderation.Moderation",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.modnote.ModNote",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.newmodmail.NewModmail",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.privatemessages.PrivateMessages",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.subreddits.Subreddits",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.users.Users",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.widgets.Widgets",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redditapi.wiki.Wiki",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.useractions.UserActions",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.redis.RedisAPI",
        },
        {
          "name": "default",
          "typeName": "devvit.plugin.settings.v1alpha.Settings",
        },
      ],
    }
  `));
