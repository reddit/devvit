import { Devvit } from '@devvit/public-api';
import { devAction } from '../external/app-actions/index.js';
import { DevvTools, DevvToolsMode, redisHandler } from '../external/devv-tools/index.js';
import { redditApiHandler } from '../external/devv-tools/reddit-api-mock-service/index.js';
import { APP_MODE } from '../config.js';
import { httpHandler, httpResponse } from '../external/devv-tools/http-mock-service/index.js';

// TODO: include as a requirement in README.md https://reddit.atlassian.net/browse/DXE-404
Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true,
});

export const App = (context: Devvit.Context): JSX.Element => {
  const [isDevMode, setIsDevMode] = context.useState<boolean>(APP_MODE === DevvToolsMode.Dev);

  // TODO: include as a requirement in README.md https://reddit.atlassian.net/browse/DXE-404
  const developerActions = [
    devAction(isDevMode ? 'Disable mocks' : 'Enable mocks', () => {
      setIsDevMode(!isDevMode);
    }),
  ];

  const devvToolsMode = isDevMode ? DevvToolsMode.Dev : DevvToolsMode.Prod;
  const ActionToolbarWrapper = DevvTools.toolbar({
    context,
    mode: devvToolsMode,
  });

  const { devvRedis, devvRedditApi, devvFetch } = DevvTools.api({
    context,
    mode: devvToolsMode,
    handlers: [
      redisHandler.get('mocked_key', () => 'Value from mocks!'),
      redditApiHandler.getSubredditById((id: string) => ({ name: `mock_${id}` })),
      httpHandler.get('https://example.com', () => httpResponse.ok({ fetched: 'mock' })),
    ],
  });

  const onPress = async (): Promise<void> => {
    const postId = context.postId;
    const redisValue = await devvRedis.get('mocked_key');
    const incr = await devvRedis.incrBy('incrKey', 1);
    const redditApiValue = (await devvRedditApi.getSubredditById(postId!)).name;
    const fetchedValue = await devvFetch('https://example.com');
    context.ui.showToast(`fetch status ${fetchedValue.status}`);
    context.ui.showToast(JSON.stringify({ redisValue }));
    context.ui.showToast(JSON.stringify({ incr }));
    context.ui.showToast(JSON.stringify({ redditApiValue }));
    context.ui.showToast(`json ${JSON.stringify(await fetchedValue.json())}`);
  };
  return (
    <ActionToolbarWrapper actions={developerActions}>
      <vstack padding="medium" cornerRadius="medium" gap="medium" alignment="middle">
        <text style="heading" size="xxlarge">
          Hello, world! 👋
        </text>
        <button appearance="primary" onPress={onPress}>
          Click me!
        </button>
      </vstack>
    </ActionToolbarWrapper>
  );
};
