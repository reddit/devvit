import { Devvit } from '@devvit/public-api';
import { ChannelStatus } from '@devvit/public-api/types/realtime.js';
const defaultSnoovatarUrl = 'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png';

Devvit.configure({
  redis: true,
  redditAPI: true,
  realtime: true,
});

interface UserData {
  id: string;
  username: string;
  snoovatarUrl: string | undefined;
  message?: string;
  x: number;
  y: number;
}

type UserRecord = {
  id: string;
  name: string;
};

type Location = {
  x: number;
  y: number;
};

type Payload = {
  location: Location;
  user: UserRecord;
};

type RealtimeMessage = {
  payload: Payload;
  session: string;
};

type PostData = {
  users: items;
};

type items = {
  [key: string]: UserData;
};

function sessionId(): string {
  let id = '';
  const asciiZero = '0'.charCodeAt(0);
  for (let i = 0; i < 4; i++) {
    id += String.fromCharCode(Math.floor(Math.random() * 26) + asciiZero);
  }
  return id;
}

const App: Devvit.CustomPostComponent = ({ useState, useChannel, reddit, userId }) => {
  const [me] = useState<UserRecord>(async () => {
    const user = await reddit.getCurrentUser();
    return {
      id: user.id,
      name: user.username,
    };
  });

  const mySession = sessionId();

  const [postData, setPostData] = useState<PostData>(async () => {
    const currentUser = await reddit.getCurrentUser();
    const userData = {
      id: currentUser.id,
      username: currentUser.username,
      snoovatarUrl: await currentUser.getSnoovatarUrl(),
      ...getRandomPosition(),
    };
    const users = {} as items;
    users[currentUser.id] = userData;
    return { users: users };
  });

  const channel = useChannel({
    name: 'locations',
    onMessage: (data) => {
      const msg = data as RealtimeMessage;
      if (msg.session === mySession) {
        return;
      }
      const payload = msg.payload;
      const x = payload.location.x;
      const y = payload.location.y;
      postData.users[payload.user.id] = {
        ...postData.users[payload.user.id],
        x,
        y,
      };
      setPostData(postData);
    },
    onSubscribed: async () => {},
  });
  channel.subscribe();

  const updatePosition = async (xOffset: number, yOffset: number): Promise<void> => {
    if (!userId) {
      return;
    }

    let x = postData.users[userId].x + xOffset;
    let y = postData.users[userId].y + yOffset;

    if (x < 0) {
      x = 0;
    } else if (x > 21) {
      x = 21;
    }

    if (y < 0) {
      y = 0;
    } else if (y > 9) {
      y = 9;
    }

    postData.users[userId] = {
      ...postData.users[userId],
      x,
      y,
    };

    setPostData(postData);
    const payload: Payload = {
      location: { x: x, y: y },
      user: me,
    };
    const message: RealtimeMessage = {
      payload: payload,
      session: mySession,
    };
    await channel.send(message);
  };

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

  const users = Object.values(postData.users)
    .sort((a, b) => a.y - b.y)
    .map((user) => {
      return <Snoo user={user} x={user.x} y={user.y} isCurrentUser={user.id === userId} />;
    });

  return (
    <blocks height="tall">
      <zstack>
        <vstack alignment="end">
          <hstack height="50px" alignment="center">
            <spacer size="medium" />
            <text size="medium" weight="bold">
              Connected: {statusLight}
            </text>
          </hstack>
        </vstack>
        {users}
        <vstack>
          <Padding offset={0} extraPadding={10} />
          <hstack padding="large" gap="large">
            <vstack
              alignment="center"
              backgroundColor="rgba(0,0,0,0.8)"
              cornerRadius="full"
              padding="small"
            >
              <hstack>
                <button
                  disabled={channel.status !== ChannelStatus.Connected}
                  size="small"
                  onPress={async () => {
                    await updatePosition(0, -1);
                  }}
                >
                  ↑
                </button>
              </hstack>
              <hstack>
                <button
                  disabled={channel.status !== ChannelStatus.Connected}
                  size="small"
                  onPress={async () => await updatePosition(-1, 0)}
                >
                  ←
                </button>
                <spacer size="large" />
                <button
                  disabled={channel.status !== ChannelStatus.Connected}
                  size="small"
                  onPress={async () => await updatePosition(1, 0)}
                >
                  →
                </button>
              </hstack>
              <hstack>
                <button
                  disabled={channel.status !== ChannelStatus.Connected}
                  size="small"
                  onPress={async () => await updatePosition(0, 1)}
                >
                  ↓
                </button>
              </hstack>
            </vstack>
          </hstack>
        </vstack>
      </zstack>
    </blocks>
  );
};

interface SnooProps {
  user: UserData;
  x: number;
  y: number;
  isCurrentUser?: boolean;
}

const Snoo = ({ user, x, y, isCurrentUser }: SnooProps): JSX.Element => {
  return (
    <vstack>
      <spacer size="medium" />
      <Padding offset={4} extraPadding={y} />
      <hstack>
        <Padding offset={0} extraPadding={x} />
        <vstack alignment="center">
          {user.message ? (
            <vstack>
              <hstack>
                <Padding offset={0} extraPadding={2} />
                <vstack backgroundColor="white" padding="small" cornerRadius="medium">
                  <text color="black" size="small">
                    {user.message}
                  </text>
                </vstack>
              </hstack>
            </vstack>
          ) : (
            <vstack>
              <Padding offset={0} extraPadding={1} />
            </vstack>
          )}
          <image url={user.snoovatarUrl ?? defaultSnoovatarUrl} imageHeight={100} imageWidth={80} />
          <vstack
            backgroundColor={isCurrentUser ? '#A50016' : '#ACACAC'}
            padding="xsmall"
            cornerRadius="small"
          >
            <text color={isCurrentUser ? 'white' : 'black'} size="xsmall">
              u/{user.username}
            </text>
          </vstack>
        </vstack>
      </hstack>
    </vstack>
  );
};

function getRandomPosition(): {
  x: number;
  y: number;
} {
  const canvasWidth = 20;
  const canvasHeight = 9;

  return {
    x: Math.floor(Math.random() * (canvasWidth - 5)) + Math.random() * 3,
    y: Math.floor(Math.random() * (canvasHeight - 5)) + Math.random() * 2,
  };
}

const Padding = ({
  offset,
  extraPadding,
}: {
  offset: number;
  extraPadding?: number;
}): JSX.Element => (
  <>
    {Array.from({ length: offset }).map(() => (
      <spacer size="large" />
    ))}
    {extraPadding ? Array.from({ length: extraPadding }).map(() => <spacer size="large" />) : <></>}
  </>
);

Devvit.addCustomPostType({
  name: 'Snooclub - Backed by Realtime',
  render: App,
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create a Snooclub',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Interactive Snooclub',
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
