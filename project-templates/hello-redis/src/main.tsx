import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Progress bar backed by Redis',
  render: ({ useState, redis, postId }) => {
    const key = (postId: string | undefined): string => {
      return `progress_bar_state:${postId}`;
    };

    // Store the progress state keyed by post ID
    const [progress, setProgress] = useState(async () => {
      const state = await redis.get(key(postId));
      return parseInt(state || '0');
    });

    return (
      <vstack alignment="center middle" height={100} gap="medium" padding="large">
        <vstack backgroundColor="#FFD5C6" cornerRadius="full" width={100}>
          <hstack backgroundColor="#D93A00" width={progress}>
            <spacer size="medium" shape="square" />
          </hstack>
        </vstack>
        <hstack gap="medium" width={100}>
          <button
            icon="subtract-fill"
            width={50}
            onPress={async () => {
              // On Subtract button press - decrease the underlying progress state
              const decrease_fn = (progress: number) => Math.max(progress - 10, 0);
              await redis.set(key(postId), decrease_fn(progress).toString());
              setProgress(decrease_fn);
            }}
          />
          <button
            icon="add-fill"
            width={50}
            onPress={async () => {
              // On Add button press - increase the underlying progress state
              const increase_fn = (progress: number) => Math.min(progress + 10, 100);
              await redis.set(key(postId), increase_fn(progress).toString());
              setProgress(increase_fn);
            }}
          />
        </hstack>
      </vstack>
    );
  },
});

export default Devvit;
