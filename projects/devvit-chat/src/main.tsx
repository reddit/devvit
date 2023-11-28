import { Devvit } from '@devvit/public-api';
import { ChannelStatus } from '@devvit/public-api/types/realtime.js';
import { ChatMessage, MsgType, RealtimeMessage, UserRecord, UserStatus } from './types.js';
import { sessionId } from './util.js';

Devvit.configure({
  redditAPI: true,
  realtime: true,
});

Devvit.addCustomPostType({
  name: 'Devvit Chat',
  height: 'tall',
  render: ({ reddit, useChannel, useState, useForm, useInterval, ui }) => {
    const [me] = useState<UserRecord>(async () => {
      const user = await reddit.getCurrentUser();
      return {
        id: user.id,
        session: sessionId(),
        name: user.username,
        lastSeen: Date.now(),
      };
    });
    const [log, setLog] = useState<RealtimeMessage[]>([]);
    const [userList, setUserList] = useState<Record<string, UserRecord>>({ [me.id]: me });
    const [userLastSeen, setUserLastSeen] = useState<Record<string, number>>({});

    const addLog = (msg: RealtimeMessage) => {
      log.unshift(msg);
      setLog(log.slice(0, 20));
    };

    const send = (msg: string) => async () => {
      const message: ChatMessage = {
        type: MsgType.Message,
        user: me,
        message: msg,
      };
      addLog(message);
      await channel.send(message);
    };

    const channel = useChannel({
      name: 'chat',
      onMessage: (data) => {
        const msg = data as RealtimeMessage;
        const now = Date.now();

        if (msg.user.id === me.id && msg.user.session === me.session) {
          return;
        }

        if (msg.type === MsgType.Presence) {
          if (!userList[msg.user.id]) {
            addLog({
              type: MsgType.Presence,
              user: msg.user,
              status: UserStatus.Joined,
            });
          }
          userList[msg.user.id] = msg.user;
          userLastSeen[msg.user.id] = now;
          setUserList(userList);
          setUserLastSeen(userLastSeen);
        } else if (msg.type === MsgType.Message) {
          addLog(msg);
        }
      },
      onSubscribed: async () => {
        await channel.send({
          type: MsgType.Presence,
          user: me,
          status: UserStatus.Joined,
        });
      },
    });
    channel.subscribe();

    const userTimeout = useInterval(async () => {
      const now = Date.now();
      for (const user of Object.keys(userList)) {
        if (now - userLastSeen[user] > 5000 && user !== me.id) {
          addLog({
            type: MsgType.Presence,
            user: userList[user],
            status: UserStatus.Left,
          });

          delete userList[user];
          delete userLastSeen[user];
          setUserList(userList);
        }
      }
      await channel.send({
        type: MsgType.Presence,
        user: me,
        status: UserStatus.Ping,
      });
    }, 1000);
    userTimeout.start();

    const inputForm = useForm(
      {
        title: 'Enter a message',
        fields: [
          {
            type: 'string',
            name: 'msg',
            label: 'Message',
          },
        ],
        acceptLabel: 'Send',
      },
      async ({ msg }) => {
        await send(msg)();
      }
    );

    const history = log.map((m) =>
      m.type === MsgType.Message ? (
        <hstack gap={'small'}>
          <text weight={'bold'}>{m.user.name}:</text>
          <text>{m.message}</text>
        </hstack>
      ) : (
        <text color={'#888'}>
          {m.user.name} has {m.status === UserStatus.Left ? 'left' : 'joined'}
        </text>
      )
    );
    const users = Object.keys(userList)
      .sort()
      .map((u) => <text>{userList[u].name}</text>);

    const promptForMessage = () => {
      ui.showForm(inputForm);
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

    return (
      <vstack grow padding={'small'} gap={'small'}>
        <hstack alignment={'end'}>
          <text>{statusLight}</text>
        </hstack>
        <hstack gap={'small'} grow>
          <vstack reverse grow>
            {history}
          </vstack>
          <vstack border={'thin'} />
          <vstack gap={'small'}>
            <text weight={'bold'}>Online:</text>
            <hstack border={'thin'} />
            {users}
          </vstack>
        </hstack>
        <hstack border={'thin'} />
        <hstack gap={'small'} alignment={'middle'}>
          <text>Send:</text>
          <button disabled={channel.status !== ChannelStatus.Connected} onPress={send('😎')}>
            😎
          </button>
          <button disabled={channel.status !== ChannelStatus.Connected} onPress={send('🎉')}>
            🎉
          </button>
          <button disabled={channel.status !== ChannelStatus.Connected} onPress={send('🤔')}>
            🤔
          </button>
          <button disabled={channel.status !== ChannelStatus.Connected} onPress={promptForMessage}>
            Custom
          </button>
        </hstack>
      </vstack>
    );
  },
});

export default Devvit;
