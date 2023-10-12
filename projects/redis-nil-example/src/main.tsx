import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Hello Redis Nil',
  render: ({ useState, redis }) => {
    const [state, setState] = useState(async () => {
      const state = await redis.get('thiskeyisnotpresent');
      return parseInt(state || '0');
    });

    return (
      <vstack padding="medium" gap="medium" backgroundColor="#FFBEA6" cornerRadius="medium">
        <button
          icon="add-fill"
          width={50}
          onPress={async () => {
            const fn = (x: number) => Math.max(x + 10, 100);
            await redis.set('another_key', fn(state).toString());
            setState(fn);
          }}
        />
      </vstack>
    );
  },
});

export default Devvit;
