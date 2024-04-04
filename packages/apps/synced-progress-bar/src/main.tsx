import { Devvit } from '@devvit/public-api';
import { ChannelStatus } from '@devvit/public-api/types/realtime.js';

Devvit.configure({
  redis: true,
  redditAPI: true,
  realtime: true,
});

type Payload = {
  progress: number;
  user: UserRecord;
};

type UserRecord = {
  id: string;
  name: string;
};

type RealtimeMessage = {
  payload: Payload;
  session: string;
};

function sessionId(): string {
  let id = '';
  const asciiZero = '0'.charCodeAt(0);
  for (let i = 0; i < 4; i++) {
    id += String.fromCharCode(Math.floor(Math.random() * 26) + asciiZero);
  }
  return id;
}

const App: Devvit.CustomPostComponent = ({ useState, useChannel, redis, reddit, postId }) => {
  const key = (postId: string | undefined): string => {
    return `progress_bar_state:${postId}`;
  };

  // Store the progress state keyed by post ID
  const [progress, setProgress] = useState(async () => {
    const state = await redis.get(key(postId));
    return parseInt(state || '0');
  });

  const mySession = sessionId();

  const [me] = useState<UserRecord>(async () => {
    const user = await reddit.getCurrentUser();
    return {
      id: user.id,
      name: user.username,
    };
  });

  const progressChannel = useChannel({
    name: 'progress_state',
    onMessage: (message) => {
      const data = message as RealtimeMessage;
      if (message.session === mySession) {
        return;
      }
      setProgress(data.payload.progress);
    },
    onSubscribed: async () => {},
  });
  progressChannel.subscribe();

  return (
    <vstack alignment="center middle" height={100} gap="medium" padding="large">
      <vstack backgroundColor="#FFD5C6" cornerRadius="full" width={100}>
        <hstack backgroundColor="#D93A00" width={progress}>
          <spacer size="medium" shape="square" />
        </hstack>
      </vstack>
      <hstack gap="medium" width={100}>
        <button
          disabled={progressChannel.status !== ChannelStatus.Connected}
          icon="subtract-fill"
          width={50}
          onPress={async () => {
            // On Subtract button press - decrease the underlying progress state
            const newProgress = Math.max(progress - 10, 0);
            const payload: Payload = {
              progress: newProgress,
              user: me,
            };
            const message: RealtimeMessage = {
              payload: payload,
              session: mySession,
            };
            setProgress(newProgress); // update local state
            await progressChannel.send(message); // send message for peer-to-peer synchronization
            await redis.set(key(postId), newProgress.toString()); // update persistent datastore
          }}
        />
        <button
          disabled={progressChannel.status !== ChannelStatus.Connected}
          icon="add-fill"
          width={50}
          onPress={async () => {
            // On Add button press - increase the underlying progress state
            const newProgress = Math.min(progress + 10, 100);
            const payload: Payload = {
              progress: newProgress,
              user: me,
            };
            const message: RealtimeMessage = {
              payload: payload,
              session: mySession,
            };
            setProgress(newProgress); // update local state
            await progressChannel.send(message); // send message for peer-to-peer synchronization
            await redis.set(key(postId), newProgress.toString()); // update persistent datastore
          }}
        />
      </hstack>
    </vstack>
  );
};

Devvit.addCustomPostType({
  name: 'Progress bar backed by Realtime',
  render: App,
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create a Synced Progress Bar',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Synced Progress Bar',
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
