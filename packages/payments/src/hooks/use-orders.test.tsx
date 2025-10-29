/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { type UIEvent, UIEventScope, type UIRequest } from '@devvit/protos';
import { Devvit } from '@devvit/public-api';
import { BlocksHandler } from '@devvit/public-api/devvit/internals/blocks/handler/BlocksHandler.js';
import { captureHookRef } from '@devvit/public-api/devvit/internals/blocks/handler/refs.js';
import type { HookRef } from '@devvit/public-api/devvit/internals/blocks/handler/types.js';
import { type JsonValue } from '@devvit/shared-types/json.js';
import { describe, expect, test, vi } from 'vitest';

import { paymentsPlugin } from '../plugin.js';
import { emptyRequest, meta, serializeLoadedDataState, UI_STATE } from './test-helpers.js';
import { getOrders, useOrders } from './use-orders.js';
import * as mocks from './use-orders.mock.js';

describe(getOrders.name, () => {
  test('calls the API with the correct cursor data and returns orders', async () => {
    const mockResponse = {
      orders: mocks.protoOrders,
      pageInfo: {
        hasNextPage: true,
        endCursor: 'nextPageToken',
        hasPreviousPage: false,
        startCursor: 'initialToken',
      },
    };
    vi.spyOn(paymentsPlugin, 'GetOrders').mockResolvedValue(mockResponse);

    const opts = { nextPageToken: 'initialToken' };
    const actualOrders = await getOrders(opts);

    expect(paymentsPlugin.GetOrders).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: 'initialToken' })
    );
    expect(actualOrders.orders).toEqual(mocks.orders);
    expect(actualOrders.nextPage).toEqual('nextPageToken');
  });
});

describe(useOrders.name, () => {
  const hookRef: HookRef = {};
  const Component = (): JSX.Element => {
    const { loading, error, orders, nextPage } = captureHookRef(
      useOrders({} as Devvit.Context),
      hookRef
    );

    return (
      <hstack>
        <text>
          {loading && UI_STATE.Loading}
          {error && UI_STATE.Error}
          {orders.length > 0 && serializeLoadedDataState(orders)}
        </text>
        <button onPress={nextPage}>Refetch</button>
      </hstack>
    );
  };
  const asyncRequestEvent = (ref: HookRef, depends: JsonValue = 1): UIEvent => {
    return {
      scope: UIEventScope.ALL,
      asyncRequest: { requestId: (ref.id ?? '') + '-' + JSON.stringify(depends) },
      hook: ref.id,
      async: true,
    };
  };

  beforeEach(() => {
    vi.spyOn(paymentsPlugin, 'GetOrders').mockResolvedValue({
      orders: mocks.protoOrders,
      pageInfo: {
        hasNextPage: true,
        endCursor: 'nextPageToken',
        hasPreviousPage: false,
        startCursor: 'initialToken',
      },
    });
  });
  test('initial load', async () => {
    const handler = new BlocksHandler(Component);
    const res = await handler.handle(emptyRequest(), meta);
    expect(JSON.stringify(res.blocks)).toContain(UI_STATE.Loading);
  });

  test('should resolve to orders', async () => {
    const handler = new BlocksHandler(Component);
    // First, make an empty request to mount the component which will trigger the hooks
    let res = await handler.handle(emptyRequest(), meta);
    // Only the delta is returned as state. In this case, the useState mounts and the
    // useAsync is loading
    expect(res.state).toMatchInlineSnapshot(`
      {
        "Component.useAsync-1": {
          "data": null,
          "depends": "",
          "error": null,
          "load_state": "loading",
        },
        "Component.useState-0": {
          "error": null,
          "load_state": "loaded",
          "value": "",
        },
        "__cache": {},
      }
    `);
    // Make sure the blocks UI is loading
    expect(JSON.stringify(res.blocks)).toContain(UI_STATE.Loading);

    // Now, make another request to try and resolve the useAsync value since it's loading
    const request: UIRequest = {
      events: [asyncRequestEvent(hookRef, '')], // Don't forget the depends here otherwise useAsync won't work!!
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
              "value": {
                "nextPageToken": "nextPageToken",
                "orders": [
                  {
                    "createdAt": "2024-03-21T12:00:00.000Z",
                    "id": "1",
                    "metadata": {
                      "type": "subscription",
                    },
                    "products": [
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
                    ],
                    "status": "DELIVERED",
                    "updatedAt": "2024-03-30T12:40:50.000Z",
                  },
                  {
                    "createdAt": "2024-04-01T12:00:00.000Z",
                    "id": "2",
                    "metadata": {
                      "type": "purchase",
                    },
                    "products": [
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
                    "status": "NEW",
                    "updatedAt": "2024-04-30T12:10:20.000Z",
                  },
                ],
              },
            },
            "requestId": "Component.useAsync-1-""",
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
          "data": {
            "nextPageToken": "nextPageToken",
            "orders": [
              {
                "createdAt": "2024-03-21T12:00:00.000Z",
                "id": "1",
                "metadata": {
                  "type": "subscription",
                },
                "products": [
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
                ],
                "status": "DELIVERED",
                "updatedAt": "2024-03-30T12:40:50.000Z",
              },
              {
                "createdAt": "2024-04-01T12:00:00.000Z",
                "id": "2",
                "metadata": {
                  "type": "purchase",
                },
                "products": [
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
                "status": "NEW",
                "updatedAt": "2024-04-30T12:10:20.000Z",
              },
            ],
          },
          "depends": "",
          "error": null,
          "load_state": "loaded",
        },
        "Component.useState-0": {
          "error": null,
          "load_state": "loaded",
          "value": "",
        },
        "__cache": {},
      }
    `);

    // Finally, make sure blocks is there!
    expect(JSON.stringify(res2.blocks)).toContain(UI_STATE.DataLoaded);
    expect(JSON.stringify(res2.blocks?.config?.rootConfig?.children)).toMatchInlineSnapshot(
      `"[{"type":1,"config":{"stackConfig":{"children":[{"type":2,"config":{"textConfig":{"text":"falseData loaded! :  [{\\"id\\":\\"1\\",\\"status\\":\\"DELIVERED\\",\\"createdAt\\":\\"2024-03-21T12:00:00.000Z\\",\\"updatedAt\\":\\"2024-03-30T12:40:50.000Z\\",\\"products\\":[{\\"sku\\":\\"fox\\",\\"price\\":10,\\"accountingType\\":\\"CONSUMABLE\\",\\"displayName\\":\\"Fox\\",\\"description\\":\\"A fox\\",\\"metadata\\":{\\"color\\":\\"red\\"}}],\\"metadata\\":{\\"type\\":\\"subscription\\"}},{\\"id\\":\\"2\\",\\"status\\":\\"NEW\\",\\"createdAt\\":\\"2024-04-01T12:00:00.000Z\\",\\"updatedAt\\":\\"2024-04-30T12:10:20.000Z\\",\\"products\\":[{\\"sku\\":\\"mouse\\",\\"price\\":50,\\"accountingType\\":\\"CONSUMABLE\\",\\"displayName\\":\\"Mouse\\",\\"description\\":\\"A mouse\\",\\"metadata\\":{\\"color\\":\\"gray\\"}}],\\"metadata\\":{\\"type\\":\\"purchase\\"}}]","overflow":1}},"actions":[],"key":"0"},{"type":3,"config":{"buttonConfig":{"text":"Refetch"}},"actions":[{"type":0,"id":"Component.hstack.button-1.onPress","data":{}}],"key":"1"}],"direction":0}},"actions":[]}]"`
    );
  });
});
