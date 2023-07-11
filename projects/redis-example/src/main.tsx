import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Hello Redis',
  render: ({ useState, redis }) => {
    const [state, setState] = useState(async () => {
      await redis.zAdd('hello-redis', {
        member: new Date().getTime().toString(),
        score: new Date().getTime(),
      });

      const top = await redis.zRange('hello-redis', 0, 100);

      console.log('top', top);

      return {
        top,
      };
    });
    return (
      <vstack padding="medium" gap="medium" backgroundColor="#FFBEA6" cornerRadius="medium">
        {state.top.map((item) => {
          return (
            <button
              onPress={async () => {
                console.log('hi');
                item.score += 1;
                setState({ top: state.top });
                await redis.zAdd('hello-redis', item);
              }}
            >
              {item.member} {item.score}
            </button>
          );
        })}
      </vstack>
    );
  },
});

export default Devvit;
