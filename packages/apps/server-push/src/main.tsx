import { Devvit } from '@devvit/public-api';
import { ChannelStatus } from '@devvit/public-api/types/realtime.js';

Devvit.configure({
  realtime: true,
  redditAPI: true,
});

type RealtimeMessage = {
  serverTime: string;
};

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, { scheduler }) => {
    await scheduler.runJob({
      name: 'reset_server_time',
      cron: '* * * * *',
    });
  },
});

Devvit.addSchedulerJob({
  name: 'reset_server_time',
  onRun: async (_, { realtime }) => {
    await realtime.send('events', {
      serverTime: new Date().toLocaleString('en-US', { timeZone: 'UTC' }),
    });
  },
});

Devvit.addCustomPostType({
  name: 'Server-Push backed Counter',
  render: (context) => {
    const [serverTime, setServerTime] = context.useState(
      new Date().toLocaleString('en-US', { timeZone: 'UTC' })
    );
    const channel = context.useChannel({
      name: 'events',
      onMessage: (message) => {
        const data = message as RealtimeMessage;
        console.log('received message from server: ' + data.serverTime);
        setServerTime(data.serverTime);
      },
      onSubscribed: async () => {},
    });

    channel.subscribe();

    let statusLight: string;
    switch (channel.status) {
      case ChannelStatus.Connecting:
        statusLight = '🟡';
        break;
      case ChannelStatus.Connected:
        statusLight = '🟢';
        break;
      case ChannelStatus.Disconnecting:
        statusLight = '🟠';
        break;
      case ChannelStatus.Disconnected:
        statusLight = '🔴';
        break;
      case ChannelStatus.Unknown:
      default:
        statusLight = '⚪';
        break;
    }

    return (
      <vstack alignment="center middle" height="100%">
        <hstack height="50px" alignment="center">
          <spacer size="medium" />
          <text size="medium" weight="bold">
            Connected: {statusLight}
          </text>
        </hstack>
        <text size="xxlarge">{`Server Time: ${serverTime}`}</text>
      </vstack>
    );
  },
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create a Server Push backed Post',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Server Push',
      subredditName: currentSubreddit.name,
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading a hand-crafted custom app…
          </text>
        </vstack>
      ),
    });
    ui.showToast(`Created custom post in r/${currentSubreddit.name}!`);
  },
});

export default Devvit;
