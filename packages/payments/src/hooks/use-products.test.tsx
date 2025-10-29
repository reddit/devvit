/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { UIEventScope, type UIRequest } from '@devvit/protos';
import type { UIEvent } from '@devvit/protos/payments.js';
import { Devvit } from '@devvit/public-api';
import { BlocksHandler } from '@devvit/public-api/devvit/internals/blocks/handler/BlocksHandler.js';
import { captureHookRef } from '@devvit/public-api/devvit/internals/blocks/handler/refs.js';
import type { HookRef } from '@devvit/public-api/devvit/internals/blocks/handler/types.js';
import type { JsonValue } from '@devvit/shared-types/json.js';
import { describe, expect, test, vi } from 'vitest';

import { paymentsPlugin } from '../plugin.js';
import {
  emptyRequest,
  meta,
  serializeLoadedDataState,
  UI_STATE,
  USE_ASYNC_HOOK_ID,
  USE_STATE_HOOK_ID,
} from './test-helpers.js';
import { getProducts, useProducts } from './use-products.js';
import * as mocks from './use-products.mock.js';

describe(getProducts.name, () => {
  test('returns an array of orders', async () => {
    vi.spyOn(paymentsPlugin, 'GetProducts').mockResolvedValue({
      products: mocks.protoProducts,
    });
    const actualProducts = await getProducts();
    expect(actualProducts).toEqual(mocks.products);
  });
});

const hookRef: HookRef = {};

describe(useProducts.name, () => {
  const asyncRequestEvent = (ref: HookRef, depends: JsonValue = 1): UIEvent => {
    return {
      scope: UIEventScope.ALL,
      asyncRequest: { requestId: (ref.id ?? '') + '-' + JSON.stringify(depends) },
      hook: ref.id,
      async: true,
    };
  };

  const Component = (): JSX.Element => {
    const { loading, products, error, refetch } = captureHookRef(
      useProducts({} as Devvit.Context),
      hookRef
    );
    return (
      <hstack>
        <text>
          {loading && UI_STATE.Loading}
          {error && UI_STATE.Error}
          {products.length > 0 && serializeLoadedDataState(products)}
        </text>
        <button onPress={refetch}>Refetch</button>
      </hstack>
    );
  };

  test('assumption for hook ids in tests are valid', async () => {
    const handler = new BlocksHandler(Component);
    const res = await handler.handle({ events: [] }, meta);
    expect(res.state?.[USE_STATE_HOOK_ID]).toBeDefined();
    expect(res.state?.[USE_ASYNC_HOOK_ID]).toBeDefined();
    expect(res.state?.[USE_STATE_HOOK_ID]).toMatchInlineSnapshot(`
      {
        "error": null,
        "load_state": "loaded",
        "value": 0,
      }
    `);
    expect(res.state?.[USE_ASYNC_HOOK_ID]).toMatchInlineSnapshot(`
      {
        "data": null,
        "depends": 0,
        "error": null,
        "load_state": "loading",
      }
    `);
  });
  beforeEach(() => {
    vi.spyOn(paymentsPlugin, 'GetProducts').mockResolvedValue({
      products: mocks.protoProducts,
    });
  });

  test('initial load', async () => {
    const handler = new BlocksHandler(Component);
    const res = await handler.handle(emptyRequest(), meta);
    expect(JSON.stringify(res.blocks)).toContain(UI_STATE.Loading);
  });

  test('should resolve to products', async () => {
    const handler = new BlocksHandler(Component);
    // First, make an empty request to mount the component which will trigger the hooks
    let res = await handler.handle(emptyRequest(), meta);
    // Only the delta is returned as state. In this case, the useState mounts and the
    // useAsync is loading
    expect(res.state).toMatchInlineSnapshot(`
      {
        "Component.useAsync-1": {
          "data": null,
          "depends": 0,
          "error": null,
          "load_state": "loading",
        },
        "Component.useState-0": {
          "error": null,
          "load_state": "loaded",
          "value": 0,
        },
        "__cache": {},
      }
    `);

    // Make sure the blocks UI is loading
    expect(JSON.stringify(res.blocks)).toContain(UI_STATE.Loading);

    // Now, make another request to try and resolve the useAsync value since it's loading
    const request: UIRequest = {
      events: [asyncRequestEvent(hookRef, 0)], // Don't forget the depends here otherwise useAsync won't work!!
      state: structuredClone(res.state),
    };

    // Make the response
    res = await handler.handle(request, meta);

    // Tricky: The response will contain an event that has the async response, but it won't be reflected on state yet.
    // We need to process the event!
    expect(res.events).toMatchInlineSnapshot(`
      [
        {
          "asyncResponse": {
            "data": {
              "value": [
                {
                  "accountingType": "CONSUMABLE",
                  "description": "A fox",
                  "displayName": "Fox",
                  "metadata": {
                    "color": "red",
                  },
                  "price": 10,
                  "sku": "fox",
                },
                {
                  "accountingType": "CONSUMABLE",
                  "description": "A mouse",
                  "displayName": "Mouse",
                  "metadata": {
                    "color": "gray",
                  },
                  "price": 50,
                  "sku": "mouse",
                },
              ],
            },
            "requestId": "Component.useAsync-1-0",
          },
          "hook": "Component.useAsync-1",
          "scope": 0,
        },
      ]
    `);

    // Now, we have the asyncResponse event and need to handle it to see the state changes
    // rendered on the component
    const res2 = await handler.handle(
      {
        events: res.events,
        state: structuredClone(res.state),
      },
      meta
    );

    // Nice! Now state has the delta we wanted to see of useAsync
    expect(res2.state).toMatchInlineSnapshot(`
      {
        "Component.useAsync-1": {
          "data": [
            {
              "accountingType": "CONSUMABLE",
              "description": "A fox",
              "displayName": "Fox",
              "metadata": {
                "color": "red",
              },
              "price": 10,
              "sku": "fox",
            },
            {
              "accountingType": "CONSUMABLE",
              "description": "A mouse",
              "displayName": "Mouse",
              "metadata": {
                "color": "gray",
              },
              "price": 50,
              "sku": "mouse",
            },
          ],
          "depends": 0,
          "error": null,
          "load_state": "loaded",
        },
        "Component.useState-0": {
          "error": null,
          "load_state": "loaded",
          "value": 0,
        },
        "__cache": {},
      }
    `);

    // Finally, make sure blocks is there!
    expect(JSON.stringify(res2.blocks)).toContain(UI_STATE.DataLoaded);
    expect(JSON.stringify(res2.blocks?.config?.rootConfig?.children)).toMatchInlineSnapshot(
      `"[{"type":1,"config":{"stackConfig":{"children":[{"type":2,"config":{"textConfig":{"text":"falseData loaded! :  [{\\"sku\\":\\"fox\\",\\"price\\":10,\\"accountingType\\":\\"CONSUMABLE\\",\\"displayName\\":\\"Fox\\",\\"description\\":\\"A fox\\",\\"metadata\\":{\\"color\\":\\"red\\"}},{\\"sku\\":\\"mouse\\",\\"price\\":50,\\"accountingType\\":\\"CONSUMABLE\\",\\"displayName\\":\\"Mouse\\",\\"description\\":\\"A mouse\\",\\"metadata\\":{\\"color\\":\\"gray\\"}}]","overflow":1}},"actions":[],"key":"0"},{"type":3,"config":{"buttonConfig":{"text":"Refetch"}},"actions":[{"type":0,"id":"Component.hstack.button-1.onPress","data":{}}],"key":"1"}],"direction":0}},"actions":[]}]"`
    );
  });
});
