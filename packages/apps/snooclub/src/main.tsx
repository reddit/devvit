import { Devvit, useAsync, useChannel, useState } from '@devvit/public-api';
import { ChannelStatus } from '@devvit/public-api/types/realtime.js';
import type { T2ID } from '@devvit/shared-types/tid.js';

import { ConnectionStatus } from './ui/connection-status.js';
import { Dpad } from './ui/dpad.js';

const defaultSnoovatarUrl = 'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png';

Devvit.configure({
  redis: true,
  redditAPI: true,
  realtime: true,
});

type User = {
  t2: T2ID;
  name: string;
  snoovatarURL: string | null;
  message?: string;
  x: number;
  y: number;
};

type Message = {
  name: string;
  session: string;
  t2: T2ID;
  x: number;
  y: number;
};

type World = { [t2: T2ID]: User };

function SessionID(): string {
  let id = '';
  const asciiZero = '0'.charCodeAt(0);
  for (let i = 0; i < 4; i++) {
    id += String.fromCharCode(Math.floor(Math.random() * 26) + asciiZero);
  }
  return id;
}

const App: Devvit.CustomPostComponent = (ctx) => {
  const [session] = useState(SessionID());
  const { data: user } = useAsync(async () => {
    const user = await ctx.reddit.getCurrentUser();
    if (!user) return null;
    return {
      name: user.username,
      t2: user.id,
      snoovatarURL: (await user.getSnoovatarUrl()) ?? null,
    };
  });

  const [world, setWorld] = useState<World>({});

  if (user && !world[user.t2])
    setWorld((prev) => ({
      ...prev,
      [user.t2]: {
        t2: user.t2,
        name: user.name,
        snoovatarURL: user.snoovatarURL,
        ...getRandomPosition(),
      },
    }));

  const channel = useChannel<Message>({
    name: 'locations',
    onMessage: (msg) => {
      const local = msg.session === session;
      if (ctx.debug.realtime)
        console.debug(
          `[realtime] ${user?.name ?? 'unknown'}@${msg.session} ${local ? 'ignored' : 'received'}`,
          msg
        );
      if (local) return;

      setWorld((prev) => ({
        ...prev,
        [msg.t2]: { ...prev![msg.t2], x: msg.x, y: msg.y },
      }));
    },
  });
  channel.subscribe();

  const updatePosition = async (xOffset: number, yOffset: number): Promise<void> => {
    if (!user || !world[user.t2]) {
      return;
    }

    let x = world[user.t2].x + xOffset;
    let y = world[user.t2].y + yOffset;

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

    setWorld((prev) => ({ ...prev, [user.t2]: { ...prev![user.t2], x, y } }));

    const msg = { name: user.name, session: session, t2: user.t2, x, y };
    if (ctx.debug.realtime)
      console.debug(`[realtime] ${user?.name ?? 'unknown'}@${msg.session} sends`, msg);
    await channel.send(msg);
  };

  const users = Object.values(world)
    .sort((a, b) => a.y - b.y)
    .map((user) => {
      return <Snoo user={user} x={user.x} y={user.y} isCurrentUser={user.t2 === ctx.userId} />;
    });

  return (
    <blocks height="tall">
      <zstack>
        <ConnectionStatus status={channel.status} />
        {users}
        <vstack>
          <Padding offset={0} extraPadding={10} />
          <Dpad disabled={channel.status !== ChannelStatus.Connected} onPress={updatePosition} />
        </vstack>
      </zstack>
    </blocks>
  );
};

interface SnooProps {
  user: User;
  // to-do: remove? User has x and y.
  x: number;
  y: number;
  isCurrentUser?: boolean;
}

// to-do: extract component.
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
          <image url={user.snoovatarURL ?? defaultSnoovatarUrl} imageHeight={100} imageWidth={80} />
          <vstack
            backgroundColor={isCurrentUser ? '#A50016' : '#ACACAC'}
            padding="xsmall"
            cornerRadius="small"
          >
            <text color={isCurrentUser ? 'white' : 'black'} size="xsmall">
              u/{user.name}
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
