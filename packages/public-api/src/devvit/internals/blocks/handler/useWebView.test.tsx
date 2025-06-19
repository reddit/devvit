/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { WebViewVisibility } from '@devvit/protos/types/devvit/ui/events/v1alpha/web_view.js';
import type { AssetMap } from '@devvit/shared-types/Assets.js';
import { beforeAll, describe, expect, test } from 'vitest';

import { useWebView, type UseWebViewResult } from '../../../../index.js';
import { Devvit } from '../../../Devvit.js';
import { BlocksHandler } from './BlocksHandler.js';
import { captureHookRef } from './refs.js';
import { generatePressRequest, getEmptyRequest, mockMetadata } from './test-helpers.js';
import type { HookRef } from './types.js';
import { useState } from './useState.js';

type WebViewMessage = {
  type: 'initialData';
  data: { username: string; currentCounter: number };
};

const createBaseWebView = (
  webviewHookRef: HookRef,
  buttonRef: HookRef,
  onMessage = () => {},
  onUnmount?: (hook: UseWebViewResult) => void
) => {
  const BaseWebView: Devvit.BlockComponent = (_props: JSX.Props) => {
    const webViewHook = captureHookRef(
      useWebView({
        onMessage,
        onUnmount,
      }),
      webviewHookRef
    );

    return (
      <vstack>
        <button
          onPress={captureHookRef(() => {
            webViewHook.mount();
          }, buttonRef)}
        >
          Full screen
        </button>
      </vstack>
    );
  };
  return BaseWebView;
};

const ASSET_1 = 'index.html';
const ASSET_2 = 'page.html';

const ASSETS: AssetMap = {
  [ASSET_1]: 'https://i.redd.it/index.html',
  [ASSET_2]: 'https://i.redd.it/page.html',
};

describe('useWebView', () => {
  beforeAll(() => {
    Object.keys(ASSETS).forEach((asset) => (Devvit.webViewAssets[asset] = ASSETS[asset]));
  });

  test('getUrl defaults to index.html when omitted', async () => {
    const webviewHookRef: HookRef = {};
    const showFullScreenWebviewButtonRef: HookRef = {};
    const BaseWebView: Devvit.BlockComponent = createBaseWebView(
      webviewHookRef,
      showFullScreenWebviewButtonRef
    );

    const handler = new BlocksHandler(BaseWebView);
    await handler.handle(getEmptyRequest(), mockMetadata);

    const fullScreenResponse = await handler.handle(
      generatePressRequest(showFullScreenWebviewButtonRef),
      mockMetadata
    );

    expect(fullScreenResponse.effects).toStrictEqual([
      {
        type: 9,
        webView: {
          fullscreen: {
            id: 'BaseWebView.useWebView-0',
            show: true,
            url: 'https://i.redd.it/index.html',
          },
        },
      },
    ]);
  });

  test('getUrl resolves asset when something other than the default index.html is used', async () => {
    const webviewHookRef: HookRef = {};
    const showFullScreenWebviewButtonRef: HookRef = {};
    const BaseWebView: Devvit.BlockComponent = (_props: JSX.Props) => {
      const webViewHook = captureHookRef(
        useWebView({
          url: 'page.html',
          onMessage: () => {},
        }),
        webviewHookRef
      );

      return (
        <vstack>
          <button
            onPress={captureHookRef(() => {
              webViewHook.mount();
            }, showFullScreenWebviewButtonRef)}
          >
            Full screen
          </button>
        </vstack>
      );
    };

    const handler = new BlocksHandler(BaseWebView);
    await handler.handle(getEmptyRequest(), mockMetadata);

    const fullScreenResponse = await handler.handle(
      generatePressRequest(showFullScreenWebviewButtonRef),
      mockMetadata
    );

    expect(fullScreenResponse.effects).toStrictEqual([
      {
        type: 9,
        webView: {
          fullscreen: {
            id: 'BaseWebView.useWebView-0',
            show: true,
            url: 'https://i.redd.it/page.html',
          },
        },
      },
    ]);
  });

  test('when onUnmount is set, it is called when fullscreen is torn down', async () => {
    const webviewHookRef: HookRef = {};
    const BaseWebView: Devvit.BlockComponent = (_props: JSX.Props) => {
      captureHookRef(
        useWebView({
          onMessage: () => {},
          onUnmount: (webView: UseWebViewResult) => {
            webView.postMessage({
              type: 'CLEANUP',
              data: {
                finalCount: 10,
              },
            });
          },
        }),
        webviewHookRef
      );

      return <vstack></vstack>;
    };

    const handler = new BlocksHandler(BaseWebView);
    await handler.handle(getEmptyRequest(), mockMetadata);

    const webviewToBlocksPostMessage = await handler.handle(
      {
        events: [
          {
            hook: webviewHookRef.id,
            webView: {
              fullScreen: {
                visibility: WebViewVisibility.WEBVIEW_HIDDEN,
              },
            },
          },
        ],
      },
      mockMetadata
    );

    expect(webviewToBlocksPostMessage.effects).toStrictEqual([
      {
        type: 9,
        webView: {
          postMessage: {
            app: {
              jsonString: '{"type":"CLEANUP","data":{"finalCount":10}}',
              message: {
                data: {
                  finalCount: 10,
                },
                type: 'CLEANUP',
              },
            },
            webViewId: 'BaseWebView.useWebView-0',
          },
        },
      },
    ]);
  });

  test('onMessage is called when effects are sent from the web view', async () => {
    const webviewHookRef: HookRef = {};
    const showFullScreenWebviewButtonRef: HookRef = {};
    const BaseWebView: Devvit.BlockComponent = (_props: JSX.Props) => {
      const [count, setCount] = useState(0);
      const webViewHook = captureHookRef(
        useWebView({
          onMessage: (_message: WebViewMessage, webView: UseWebViewResult) => {
            const newCount = count + 1;
            setCount(newCount);

            webView.postMessage({
              type: 'UPDATE',
              data: {
                newCount,
              },
            });
          },
        }),
        webviewHookRef
      );

      return (
        <vstack>
          <text>Count: {count}</text>
          <button
            onPress={captureHookRef(() => {
              webViewHook.mount();
            }, showFullScreenWebviewButtonRef)}
          >
            Full screen
          </button>
        </vstack>
      );
    };

    const handler = new BlocksHandler(BaseWebView);
    await handler.handle(getEmptyRequest(), mockMetadata);

    const webviewToBlocksPostMessage = await handler.handle(
      {
        events: [
          {
            hook: webviewHookRef.id,
            webView: {
              postMessage: {
                jsonString: JSON.stringify({
                  foo: 'bar',
                }),
                message: {
                  foo: 'bar',
                },
              },
            },
          },
        ],
      },
      mockMetadata
    );

    expect(webviewToBlocksPostMessage.effects).toStrictEqual([
      {
        type: 9,
        webView: {
          postMessage: {
            app: {
              jsonString: '{"type":"UPDATE","data":{"newCount":1}}',
              message: {
                data: {
                  newCount: 1,
                },
                type: 'UPDATE',
              },
            },
            webViewId: 'BaseWebView.useWebView-1',
          },
        },
      },
    ]);
  });

  test('onMessage filters out devvit-client messages', async () => {
    const webviewHookRef: HookRef = {};
    const showFullScreenWebviewButtonRef: HookRef = {};
    const BaseWebView: Devvit.BlockComponent = (_props: JSX.Props) => {
      const webViewHook = captureHookRef(
        useWebView({
          onMessage: (_message: WebViewMessage, _webView: UseWebViewResult) => {},
        }),
        webviewHookRef
      );

      return (
        <vstack>
          <button
            onPress={captureHookRef(() => {
              webViewHook.mount();
            }, showFullScreenWebviewButtonRef)}
          >
            Full screen
          </button>
        </vstack>
      );
    };

    const handler = new BlocksHandler(BaseWebView);
    await handler.handle(getEmptyRequest(), mockMetadata);

    const internalMessage = {
      event: 'pointerdown',
      scope: 0,
      type: 'devvit-internal',
    };
    const webviewToBlocksPostMessage = await handler.handle(
      {
        events: [
          {
            hook: webviewHookRef.id,
            webView: {
              postMessage: {
                jsonString: JSON.stringify(internalMessage),
                message: internalMessage,
              },
            },
          },
        ],
      },
      mockMetadata
    );

    expect(webviewToBlocksPostMessage.effects).toStrictEqual([]);
  });

  test('fullscreen webview is opened when mount() is called', async () => {
    const webviewHookRef: HookRef = {};
    const showFullScreenWebviewButtonRef: HookRef = {};
    const BaseWebView = createBaseWebView(webviewHookRef, showFullScreenWebviewButtonRef);

    const handler = new BlocksHandler(BaseWebView);
    await handler.handle(getEmptyRequest(), mockMetadata);

    const mountResponse = await handler.handle(
      generatePressRequest(showFullScreenWebviewButtonRef),
      mockMetadata
    );

    // Verify mount effect is sent
    expect(mountResponse.effects).toHaveLength(1);
    expect(mountResponse.effects[0]).toMatchObject({
      type: 9,
      webView: {
        fullscreen: {
          show: true,
          url: expect.any(String),
        },
      },
    });

    // Simulate webview becoming visible and verify state is updated
    const visibilityResponse = await handler.handle(
      {
        events: [
          {
            hook: webviewHookRef.id,
            webView: {
              fullScreen: {
                visibility: WebViewVisibility.WEBVIEW_VISIBLE,
              },
            },
          },
        ],
      },
      mockMetadata
    );

    // State should be updated to reflect mounted status
    expect(visibilityResponse.state?.[webviewHookRef.id!]).toEqual({
      messageCount: 0,
      isMounted: true,
    });
  });
});

test('mount() is a no-op when webview is already mounted', async () => {
  const webviewHookRef: HookRef = {};
  const showFullScreenWebviewButtonRef: HookRef = {};
  const BaseWebView = createBaseWebView(webviewHookRef, showFullScreenWebviewButtonRef);

  const handler = new BlocksHandler(BaseWebView);
  await handler.handle(getEmptyRequest(), mockMetadata);

  // Initial mount
  const mountResponse = await handler.handle(
    generatePressRequest(showFullScreenWebviewButtonRef),
    mockMetadata
  );

  expect(mountResponse.effects).toStrictEqual([
    {
      type: 9,
      webView: {
        fullscreen: {
          id: 'BaseWebView.useWebView-0',
          show: true,
          url: 'https://i.redd.it/index.html',
        },
      },
    },
  ]);

  // Simulate webview becoming visible
  const visibilityResponse = await handler.handle(
    {
      events: [
        {
          hook: webviewHookRef.id,
          webView: {
            fullScreen: {
              visibility: WebViewVisibility.WEBVIEW_VISIBLE,
            },
          },
        },
      ],
    },
    mockMetadata
  );

  // Verify state is updated to reflect mounted status
  expect(visibilityResponse.state?.[webviewHookRef.id!]).toEqual({
    messageCount: 0,
    isMounted: true,
  });

  // Attempt second mount - should be no-op
  const secondMountResponse = await handler.handle(
    generatePressRequest(showFullScreenWebviewButtonRef),
    mockMetadata
  );

  // No effects should be sent since webview is already mounted
  expect(secondMountResponse.effects).toHaveLength(0);
});
