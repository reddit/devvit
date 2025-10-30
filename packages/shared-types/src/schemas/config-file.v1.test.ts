import { describe, test } from 'vitest';

import {
  type AppConfigJson,
  type AppPostEntrypointConfigJson,
  parseAppConfig,
  parseAppConfigJson,
} from './config-file.v1.js';

describe('parseAppConfig()', () => {
  test('empty', () =>
    expect(() => parseAppConfig('', false)).toThrowErrorMatchingInlineSnapshot(
      `[Error: config is empty]`
    ));
  test('malformed', () =>
    expect(() => parseAppConfig('{', false)).toThrowErrorMatchingInlineSnapshot(
      `[Error: cannot parse config JSON]`
    ));

  test('ok', () =>
    expect(parseAppConfig('{ "name": "abc", "server": {} }', false)).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "abc",
          "server": {},
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));

  test('unitialized ok', () =>
    expect(parseAppConfig('{ "name": "<% name %>", "server": {} }', true)).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "<% name %>",
          "server": {},
        },
        "name": "<% name %>",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));
});

describe('parseAppConfigJSON()', () => {
  test('not an object', () =>
    expect(() => parseAppConfigJson(0, false)).toThrowErrorMatchingInlineSnapshot(
      `[Error: config is not of a type(s) object]`
    ));
  test('empty', () =>
    expect(() => parseAppConfigJson({}, false)).toThrowErrorMatchingInlineSnapshot(
      `[Error: config requires property "name"; config requires property "post", "server", or "blocks".]`
    ));
  test('bad name', () =>
    expect(() =>
      parseAppConfigJson({ name: '1', server: {} } satisfies AppConfigJson, false)
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: name does not meet minimum length of 3; name does not match pattern "^[a-z][a-z0-9-]*$". Try running \`npx devvit init\` to fix your app name.]`
    ));
  test('bad type', () =>
    expect(() =>
      parseAppConfigJson({ name: 1, server: {} }, false)
    ).toThrowErrorMatchingInlineSnapshot(`[Error: name is not of a type(s) string]`));
  test('no name', () =>
    expect(() => parseAppConfigJson({ server: {} }, false)).toThrowErrorMatchingInlineSnapshot(
      `[Error: config requires property "name"]`
    ));
  test('no post / server / blocks', () =>
    expect(() =>
      parseAppConfigJson({ name: 'name' } satisfies AppConfigJson, false)
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: config requires property "post", "server", or "blocks".]`
    ));

  test('common', () =>
    expect(
      parseAppConfigJson(
        {
          $schema: 'https://developers.reddit.com/schema/config-file.v1.json',
          name: 'name',
          server: {},
          post: {},
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
          "name": "name",
          "post": {},
          "server": {},
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": true,
            "scope": "user",
          },
          "redis": true,
          "settings": false,
          "triggers": false,
        },
        "post": {
          "dir": "public",
          "entrypoints": {
            "default": {
              "entry": "index.html",
              "height": "tall",
              "inline": false,
              "name": "default",
            },
          },
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));
  test('minimal', () =>
    expect(parseAppConfigJson({ name: 'abc', server: {} } satisfies AppConfigJson, false))
      .toMatchInlineSnapshot(`
        {
          "json": {
            "name": "abc",
            "server": {},
          },
          "name": "abc",
          "permissions": {
            "http": {
              "domains": [],
              "enable": false,
            },
            "media": false,
            "menu": false,
            "payments": false,
            "realtime": false,
            "reddit": {
              "asUser": [],
              "enable": false,
              "scope": "user",
            },
            "redis": false,
            "settings": false,
            "triggers": false,
          },
          "schema": "v1",
          "server": {
            "dir": "dist/server",
            "entry": "index.js",
          },
        }
      `));
  test('default post', () => {
    const config = parseAppConfigJson({ name: 'abc', post: {} } satisfies AppConfigJson, false);
    expect(config).toMatchInlineSnapshot(`
        {
          "json": {
            "name": "abc",
            "post": {},
          },
          "name": "abc",
          "permissions": {
            "http": {
              "domains": [],
              "enable": false,
            },
            "media": false,
            "menu": false,
            "payments": false,
            "realtime": false,
            "reddit": {
              "asUser": [],
              "enable": true,
              "scope": "user",
            },
            "redis": true,
            "settings": false,
            "triggers": false,
          },
          "post": {
            "dir": "public",
            "entrypoints": {
              "default": {
                "entry": "index.html",
                "height": "tall",
                "inline": false,
                "name": "default",
              },
            },
          },
          "schema": "v1",
        }
      `);
    {
      const l = parseAppConfigJson(
        {
          name: 'abc',
          post: { entrypoints: { default: {} as AppPostEntrypointConfigJson } },
        } satisfies AppConfigJson,
        false
      );
      l.json = { name: 'abc' };
      const r = { ...config };
      r.json = { name: 'abc' };
      expect(l).toStrictEqual(r);
    }
  });
  test('default post entry', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'abc',
          post: {
            dir: 'src/client',
            entrypoints: { default: { entry: 'abc' }, foo: { entry: 'bar' } },
          },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "abc",
          "post": {
            "dir": "src/client",
            "entrypoints": {
              "default": {
                "entry": "abc",
              },
              "foo": {
                "entry": "bar",
              },
            },
          },
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": true,
            "scope": "user",
          },
          "redis": true,
          "settings": false,
          "triggers": false,
        },
        "post": {
          "dir": "src/client",
          "entrypoints": {
            "default": {
              "entry": "abc",
              "height": "tall",
              "inline": false,
              "name": "default",
            },
            "foo": {
              "entry": "bar",
              "height": "tall",
              "inline": false,
              "name": "foo",
            },
          },
        },
        "schema": "v1",
      }
    `));
  test('default blocks', () =>
    expect(parseAppConfigJson({ name: 'abc', blocks: {} } satisfies AppConfigJson, false))
      .toMatchInlineSnapshot(`
        {
          "blocks": {
            "entry": "src/main.tsx",
          },
          "forms": {},
          "json": {
            "blocks": {},
            "name": "abc",
          },
          "menu": {
            "items": [],
          },
          "name": "abc",
          "permissions": {
            "http": {
              "domains": [],
              "enable": false,
            },
            "media": false,
            "menu": true,
            "payments": false,
            "realtime": false,
            "reddit": {
              "asUser": [],
              "enable": false,
              "scope": "user",
            },
            "redis": true,
            "settings": true,
            "triggers": true,
          },
          "schema": "v1",
          "settings": {
            "global": {},
            "subreddit": {},
          },
          "triggers": {},
        }
      `));
  test('default server', () =>
    expect(parseAppConfigJson({ name: 'abc', server: {} } satisfies AppConfigJson, false))
      .toMatchInlineSnapshot(`
        {
          "json": {
            "name": "abc",
            "server": {},
          },
          "name": "abc",
          "permissions": {
            "http": {
              "domains": [],
              "enable": false,
            },
            "media": false,
            "menu": false,
            "payments": false,
            "realtime": false,
            "reddit": {
              "asUser": [],
              "enable": false,
              "scope": "user",
            },
            "redis": false,
            "settings": false,
            "triggers": false,
          },
          "schema": "v1",
          "server": {
            "dir": "dist/server",
            "entry": "index.js",
          },
        }
      `));
  test('default triggers', () =>
    expect(
      parseAppConfigJson({ name: 'abc', server: {}, triggers: {} } satisfies AppConfigJson, false)
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "abc",
          "server": {},
          "triggers": {},
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": true,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
        "triggers": {},
      }
    `));

  test('override blocks.entry', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'abc',
          blocks: { entry: 'entry.ts' },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "blocks": {
          "entry": "entry.ts",
        },
        "forms": {},
        "json": {
          "blocks": {
            "entry": "entry.ts",
          },
          "name": "abc",
        },
        "menu": {
          "items": [],
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": true,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": true,
          "settings": true,
          "triggers": true,
        },
        "schema": "v1",
        "settings": {
          "global": {},
          "subreddit": {},
        },
        "triggers": {},
      }
    `));
  test('override blocks.menu', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'abc',
          blocks: { menu: { enable: false } },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "blocks": {
          "entry": "src/main.tsx",
        },
        "forms": {},
        "json": {
          "blocks": {
            "menu": {
              "enable": false,
            },
          },
          "name": "abc",
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": true,
          "triggers": true,
        },
        "schema": "v1",
        "settings": {
          "global": {},
          "subreddit": {},
        },
        "triggers": {},
      }
    `));
  test('override blocks.triggers', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'abc',
          blocks: { triggers: ['onAppInstall', 'onModAction'] },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "blocks": {
          "entry": "src/main.tsx",
        },
        "forms": {},
        "json": {
          "blocks": {
            "triggers": [
              "onAppInstall",
              "onModAction",
            ],
          },
          "name": "abc",
        },
        "menu": {
          "items": [],
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": true,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": true,
          "settings": true,
          "triggers": true,
        },
        "schema": "v1",
        "settings": {
          "global": {},
          "subreddit": {},
        },
        "triggers": {
          "onAppInstall": "",
          "onModAction": "",
        },
      }
    `));
  test('set post and override permissions.reddit.enable', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          permissions: { reddit: { enable: false } },
          post: {},
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "permissions": {
            "reddit": {
              "enable": false,
            },
          },
          "post": {},
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": true,
          "settings": false,
          "triggers": false,
        },
        "post": {
          "dir": "public",
          "entrypoints": {
            "default": {
              "entry": "index.html",
              "height": "tall",
              "inline": false,
              "name": "default",
            },
          },
        },
        "schema": "v1",
      }
    `));
  test('override inline', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          post: {
            entrypoints: {
              default: { entry: 'splash', inline: true, height: 'regular' },
              game: { entry: 'game', inline: true, height: 'regular' },
            },
          },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "post": {
            "entrypoints": {
              "default": {
                "entry": "splash",
                "height": "regular",
                "inline": true,
              },
              "game": {
                "entry": "game",
                "height": "regular",
                "inline": true,
              },
            },
          },
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": true,
            "scope": "user",
          },
          "redis": true,
          "settings": false,
          "triggers": false,
        },
        "post": {
          "dir": "public",
          "entrypoints": {
            "default": {
              "entry": "splash",
              "height": "regular",
              "inline": true,
              "name": "default",
            },
            "game": {
              "entry": "game",
              "height": "regular",
              "inline": true,
              "name": "game",
            },
          },
        },
        "schema": "v1",
      }
    `));
  test('override permissions.reddit.scope', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          permissions: { reddit: { scope: 'moderator' } },
          server: {},
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "permissions": {
            "reddit": {
              "scope": "moderator",
            },
          },
          "server": {},
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": true,
            "scope": "moderator",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));
  test('override permissions.reddit', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          permissions: { reddit: true },
          server: {},
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "permissions": {
            "reddit": true,
          },
          "server": {},
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": true,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));
  test('set server and override permissions.http.enable', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          permissions: { http: { enable: false } },
          server: {},
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "permissions": {
            "http": {
              "enable": false,
            },
          },
          "server": {},
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));
  test('override permissions.http.domains', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          permissions: { http: { domains: ['example.com'] } },
          server: {},
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "permissions": {
            "http": {
              "domains": [
                "example.com",
              ],
            },
          },
          "server": {},
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [
              "example.com",
            ],
            "enable": true,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));
  test('override server.entry', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'abc',
          server: { dir: 'dir', entry: 'entry' },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "abc",
          "server": {
            "dir": "dir",
            "entry": "entry",
          },
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dir",
          "entry": "entry",
        },
      }
    `));

  test('asUser scopes', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          permissions: {
            reddit: {
              scope: 'user',
              asUser: ['SUBMIT_POST', 'SUBMIT_COMMENT', 'SUBSCRIBE_TO_SUBREDDIT'],
            },
          },
          server: {},
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "permissions": {
            "reddit": {
              "asUser": [
                "SUBMIT_POST",
                "SUBMIT_COMMENT",
                "SUBSCRIBE_TO_SUBREDDIT",
              ],
              "scope": "user",
            },
          },
          "server": {},
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [
              1,
              2,
              3,
            ],
            "enable": true,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));

  test('settings config', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'test-app',
          server: {},
          settings: {
            global: {
              'my-feature-flag': {
                type: 'string',
                label: 'Feature flag to rollout a new change',
                validationEndpoint: '/internal/settings/validate',
                isSecret: false,
              },
            },
            subreddit: {
              'feature-sauce': {
                type: 'string',
                label: 'Feature sauce',
              },
              'number-sauce': {
                type: 'number',
                label: 'Number sauce',
              },
              'boolean-sauce': {
                type: 'boolean',
                label: 'Boolean sauce',
              },
              'paragraph-sauce': {
                type: 'paragraph',
                label: 'Paragraph sauce',
              },
              'my-select': {
                type: 'select',
                label: 'Select multiple options:',
                options: [
                  {
                    label: 'Option 1',
                    value: 'Option 1',
                  },
                  {
                    label: 'Option 2',
                    value: 'Option 2',
                  },
                ],
                defaultValue: 'Option 1',
              },
              'my-multi-select': {
                type: 'multiSelect',
                label: 'Select multiple options:',
                options: [
                  {
                    label: 'Option 1',
                    value: 'Option 1',
                  },
                  {
                    label: 'Option 2',
                    value: 'Option 2',
                  },
                ],
                defaultValue: ['Option 1', 'Option 2'],
              },
            },
          },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "test-app",
          "server": {},
          "settings": {
            "global": {
              "my-feature-flag": {
                "isSecret": false,
                "label": "Feature flag to rollout a new change",
                "type": "string",
                "validationEndpoint": "/internal/settings/validate",
              },
            },
            "subreddit": {
              "boolean-sauce": {
                "label": "Boolean sauce",
                "type": "boolean",
              },
              "feature-sauce": {
                "label": "Feature sauce",
                "type": "string",
              },
              "my-multi-select": {
                "defaultValue": [
                  "Option 1",
                  "Option 2",
                ],
                "label": "Select multiple options:",
                "options": [
                  {
                    "label": "Option 1",
                    "value": "Option 1",
                  },
                  {
                    "label": "Option 2",
                    "value": "Option 2",
                  },
                ],
                "type": "multiSelect",
              },
              "my-select": {
                "defaultValue": "Option 1",
                "label": "Select multiple options:",
                "options": [
                  {
                    "label": "Option 1",
                    "value": "Option 1",
                  },
                  {
                    "label": "Option 2",
                    "value": "Option 2",
                  },
                ],
                "type": "select",
              },
              "number-sauce": {
                "label": "Number sauce",
                "type": "number",
              },
              "paragraph-sauce": {
                "label": "Paragraph sauce",
                "type": "paragraph",
              },
            },
          },
        },
        "name": "test-app",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": true,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
        "settings": {
          "global": {
            "my-feature-flag": {
              "isSecret": false,
              "label": "Feature flag to rollout a new change",
              "name": "my-feature-flag",
              "type": "string",
              "validationEndpoint": "/internal/settings/validate",
            },
          },
          "subreddit": {
            "boolean-sauce": {
              "label": "Boolean sauce",
              "name": "boolean-sauce",
              "type": "boolean",
            },
            "feature-sauce": {
              "label": "Feature sauce",
              "name": "feature-sauce",
              "type": "string",
            },
            "my-multi-select": {
              "defaultValue": [
                "Option 1",
                "Option 2",
              ],
              "label": "Select multiple options:",
              "name": "my-multi-select",
              "options": [
                {
                  "label": "Option 1",
                  "value": "Option 1",
                },
                {
                  "label": "Option 2",
                  "value": "Option 2",
                },
              ],
              "type": "multiSelect",
            },
            "my-select": {
              "defaultValue": "Option 1",
              "label": "Select multiple options:",
              "name": "my-select",
              "options": [
                {
                  "label": "Option 1",
                  "value": "Option 1",
                },
                {
                  "label": "Option 2",
                  "value": "Option 2",
                },
              ],
              "type": "select",
            },
            "number-sauce": {
              "label": "Number sauce",
              "name": "number-sauce",
              "type": "number",
            },
            "paragraph-sauce": {
              "label": "Paragraph sauce",
              "name": "paragraph-sauce",
              "type": "paragraph",
            },
          },
        },
      }
    `));

  test('menu items', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          menu: {
            items: [
              {
                label: '[devvit.json] Create a new post',
                endpoint: '/internal/menu/create-post',
                description: 'Create a new post using devvit.json',
                forUserType: 'moderator',
                location: 'subreddit',
              },
              {
                label: '[devvit.json] Create a second post',
                endpoint: '/internal/menu/create-second-post',
                location: 'comment',
              },
            ],
          },
        },
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "menu": {
            "items": [
              {
                "description": "Create a new post using devvit.json",
                "endpoint": "/internal/menu/create-post",
                "forUserType": "moderator",
                "label": "[devvit.json] Create a new post",
                "location": "subreddit",
              },
              {
                "endpoint": "/internal/menu/create-second-post",
                "label": "[devvit.json] Create a second post",
                "location": "comment",
              },
            ],
          },
          "name": "name",
          "server": {},
        },
        "menu": {
          "items": [
            {
              "description": "Create a new post using devvit.json",
              "endpoint": "/internal/menu/create-post",
              "forUserType": "moderator",
              "label": "[devvit.json] Create a new post",
              "location": [
                "subreddit",
              ],
              "postFilter": "none",
            },
            {
              "description": "",
              "endpoint": "/internal/menu/create-second-post",
              "forUserType": "moderator",
              "label": "[devvit.json] Create a second post",
              "location": [
                "comment",
              ],
              "postFilter": "none",
            },
          ],
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": true,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": true,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));

  test('payments', () => {
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          payments: {
            endpoints: {
              fulfillOrder: '/internal/payments/fulfill',
              refundOrder: '/internal/payments/refund',
            },
            products: [
              {
                sku: 'askew',
                displayName: 'Askew! (Get it?)',
                description: "It's a dumb pun. A SKU == Askew",
                price: 25,
                accountingType: 'INSTANT',
              },
            ],
          },
        },
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "payments": {
            "endpoints": {
              "fulfillOrder": "/internal/payments/fulfill",
              "refundOrder": "/internal/payments/refund",
            },
            "products": [
              {
                "accountingType": "INSTANT",
                "description": "It's a dumb pun. A SKU == Askew",
                "displayName": "Askew! (Get it?)",
                "price": 25,
                "sku": "askew",
              },
            ],
          },
          "server": {},
        },
        "name": "name",
        "payments": {
          "endpoints": {
            "fulfillOrder": "/internal/payments/fulfill",
            "refundOrder": "/internal/payments/refund",
          },
          "products": [
            {
              "accountingType": "INSTANT",
              "description": "It's a dumb pun. A SKU == Askew",
              "displayName": "Askew! (Get it?)",
              "price": 25,
              "sku": "askew",
            },
          ],
        },
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `);
    expect(() =>
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          payments: {
            endpoints: {},
            products: [],
          },
        },
        false
      )
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: payments does not match allOf schema [subschema 1] with 1 error[s]:; payments.endpoints requires property "fulfillOrder"]`
    );
  });

  test('override triggers', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'abc',
          server: {},
          triggers: {
            onAppInstall: '/internal/on/install',
            onPostCreate: '/internal/on/post/create',
          },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "abc",
          "server": {},
          "triggers": {
            "onAppInstall": "/internal/on/install",
            "onPostCreate": "/internal/on/post/create",
          },
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": true,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
        "triggers": {
          "onAppInstall": "/internal/on/install",
          "onPostCreate": "/internal/on/post/create",
        },
      }
    `));

  test('scheduler', () => {
    const result = parseAppConfigJson(
      {
        name: 'name',
        server: {},
        scheduler: {
          tasks: {
            task1: {
              endpoint: '/internal/task1',
            },
            task2: {
              endpoint: '/internal/task2',
              cron: '0 * * * *',
            },
            task3: {
              endpoint: '/internal/task2',
              cron: '0 * * * *',
              data: { foo: 'bar' },
            },
            shorthandTask: '/internal/shorthand-task',
          },
        },
      } satisfies AppConfigJson,
      false
    );
    expect(result).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "scheduler": {
            "tasks": {
              "shorthandTask": "/internal/shorthand-task",
              "task1": {
                "endpoint": "/internal/task1",
              },
              "task2": {
                "cron": "0 * * * *",
                "endpoint": "/internal/task2",
              },
              "task3": {
                "cron": "0 * * * *",
                "data": {
                  "foo": "bar",
                },
                "endpoint": "/internal/task2",
              },
            },
          },
          "server": {},
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "scheduler": {
          "tasks": {
            "shorthandTask": {
              "endpoint": "/internal/shorthand-task",
            },
            "task1": {
              "endpoint": "/internal/task1",
            },
            "task2": {
              "cron": "0 * * * *",
              "endpoint": "/internal/task2",
            },
            "task3": {
              "cron": "0 * * * *",
              "data": {
                "foo": "bar",
              },
              "endpoint": "/internal/task2",
            },
          },
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `);
  });

  test('form definitions', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          forms: {
            'form-one': '/internal/form/submit-form-one',
            'form-two': '/internal/form/submit-form-two',
          },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "forms": {
          "form-one": "/internal/form/submit-form-one",
          "form-two": "/internal/form/submit-form-two",
        },
        "json": {
          "forms": {
            "form-one": "/internal/form/submit-form-one",
            "form-two": "/internal/form/submit-form-two",
          },
          "name": "name",
          "server": {},
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));

  // Additional properties at the top-level would be preferrable but it allows
  // typos. We could add a special key prefix like `#` to disambiguate or just
  // a single key to namespace all user data under like `data` but it'd be a
  // blank check to users that may have unwanted implications. If this feature
  // is needed, design it.
  test('user data', () =>
    expect(() =>
      parseAppConfigJson(
        {
          abc: 123,
          name: 'name',
          server: {},
        } satisfies AppConfigJson,
        false
      )
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: config is not allowed to have the additional property "abc"]`
    ));

  test('with dev.subreddit', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'abc',
          server: {},
          dev: { subreddit: 'my_test_sub' },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "dev": {
          "subreddit": "my_test_sub",
        },
        "json": {
          "dev": {
            "subreddit": "my_test_sub",
          },
          "name": "abc",
          "server": {},
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));
  test('marketingAssets', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'abc',
          server: {},
          marketingAssets: {
            icon: 'icon.png',
          },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "marketingAssets": {
            "icon": "icon.png",
          },
          "name": "abc",
          "server": {},
        },
        "marketingAssets": {
          "icon": "icon.png",
        },
        "name": "abc",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": false,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
      }
    `));
});

describe('validate()', () => {
  test('menu items', () =>
    expect(() =>
      parseAppConfigJson(
        {
          name: 'name',
          permissions: { redis: false },
          menu: {
            items: [
              {
                label: 'label',
                forUserType: 'moderator',
                location: 'post',
                endpoint: '/internal/endpoint',
                postFilter: 'currentApp',
              },
            ],
          },
          server: {},
        } satisfies AppConfigJson,
        false
      )
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: \`config.menu.items\` requires \`config.permissions.redis\` to be enabled.]`
    ));

  test('select setting with invalid default value', () =>
    expect(() =>
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          settings: {
            global: {
              theme: {
                type: 'select',
                label: 'Theme',
                options: [
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                ],
                defaultValue: 'invalid',
              },
            },
          },
        } satisfies AppConfigJson,
        false
      )
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Setting "theme" default value "invalid" is not in
          options "light, dark".]`
    ));

  test('multiSelect setting with invalid default values', () =>
    expect(() =>
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          settings: {
            subreddit: {
              categories: {
                type: 'multiSelect',
                label: 'Categories',
                options: [
                  { label: 'Tech', value: 'tech' },
                  { label: 'Sports', value: 'sports' },
                  { label: 'Music', value: 'music' },
                ],
                defaultValue: ['tech', 'invalid', 'nonexistent'],
              },
            },
          },
        } satisfies AppConfigJson,
        false
      )
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Setting "categories" default values "tech, invalid, nonexistent" are not in options "tech, sports, music".]`
    ));

  test('secret setting with defaultValue should fail validation', () =>
    expect(() =>
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          settings: {
            global: {
              'secret-api-key': {
                type: 'string',
                label: 'API Key',
                isSecret: true,
                defaultValue: 'default-secret-value',
              },
            },
          },
        } satisfies AppConfigJson,
        false
      )
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: settings.global.secret-api-key is not exactly one from <#/$defs/GlobalStringSetting>,<#/$defs/ParagraphSetting>,<#/$defs/NumberSetting>,<#/$defs/BooleanSetting>,<#/$defs/SelectSetting>,<#/$defs/MultiSelectSetting>]`
    ));

  test('secret setting without defaultValue should pass validation', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          settings: {
            global: {
              'secret-api-key': {
                type: 'string',
                label: 'API Key',
                isSecret: true,
              },
            },
          },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "server": {},
          "settings": {
            "global": {
              "secret-api-key": {
                "isSecret": true,
                "label": "API Key",
                "type": "string",
              },
            },
          },
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": true,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
        "settings": {
          "global": {
            "secret-api-key": {
              "isSecret": true,
              "label": "API Key",
              "name": "secret-api-key",
              "type": "string",
            },
          },
        },
      }
    `));

  test('non-secret setting with defaultValue should pass validation', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          settings: {
            global: {
              'public-config': {
                type: 'string',
                label: 'Public Config',
                isSecret: false,
                defaultValue: 'default-public-value',
              },
            },
          },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "server": {},
          "settings": {
            "global": {
              "public-config": {
                "defaultValue": "default-public-value",
                "isSecret": false,
                "label": "Public Config",
                "type": "string",
              },
            },
          },
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": true,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
        "settings": {
          "global": {
            "public-config": {
              "defaultValue": "default-public-value",
              "isSecret": false,
              "label": "Public Config",
              "name": "public-config",
              "type": "string",
            },
          },
        },
      }
    `));

  test('omitting secret with defaultValue should pass validation', () =>
    expect(
      parseAppConfigJson(
        {
          name: 'name',
          server: {},
          settings: {
            global: {
              'public-config': {
                type: 'string',
                label: 'Public Config',
                defaultValue: 'default-public-value',
              },
            },
          },
        } satisfies AppConfigJson,
        false
      )
    ).toMatchInlineSnapshot(`
      {
        "json": {
          "name": "name",
          "server": {},
          "settings": {
            "global": {
              "public-config": {
                "defaultValue": "default-public-value",
                "label": "Public Config",
                "type": "string",
              },
            },
          },
        },
        "name": "name",
        "permissions": {
          "http": {
            "domains": [],
            "enable": false,
          },
          "media": false,
          "menu": false,
          "payments": false,
          "realtime": false,
          "reddit": {
            "asUser": [],
            "enable": false,
            "scope": "user",
          },
          "redis": false,
          "settings": true,
          "triggers": false,
        },
        "schema": "v1",
        "server": {
          "dir": "dist/server",
          "entry": "index.js",
        },
        "settings": {
          "global": {
            "public-config": {
              "defaultValue": "default-public-value",
              "label": "Public Config",
              "name": "public-config",
              "type": "string",
            },
          },
        },
      }
    `));
});
