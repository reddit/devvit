import { Devvit } from '@devvit/public-api';

import { key, KeyType, userKey } from '../PollHelpers.js';
import { PageType, PollProps } from '../PollModels.js';

export const ConfirmPage: Devvit.BlockComponent<PollProps> = (
  { votes, setVotes, navigate },
  { redis, userId, postId }
) => {
  const skipOption = -2;
  const skipVote = async (): Promise<void> => {
    const user = userKey(userId, postId);
    const tx = await redis.watch(user);
    let already = false;
    try {
      already = !!(await redis.get(user));
    } catch {
      // ignored
    }
    await tx.multi();
    await tx.zAdd(key(KeyType.voted, postId), { member: user, score: 0 });
    if (already) {
      await tx.exec();
    } else {
      await tx.set(user, skipOption + '');
      await redis.incrBy(`polls:${postId}:${skipOption}`, 1);
      await tx.exec();
      setVotes(votes.map((v, i) => (i === skipOption ? v + 1 : v)));
    }
    navigate(PageType.RESULTS);
  };

  return (
    <vstack grow alignment="center middle">
      <text style="heading">Are you sure?</text>
      <text style="body">You will not be able to vote after viewing the results.</text>
      <spacer size="medium" />
      <hstack gap="large">
        <button size="large" appearance="secondary" onPress={() => navigate(PageType.VOTE)}>
          Go back to vote
        </button>
        <button size="large" appearance="destructive" onPress={() => skipVote()}>
          Show me the results!
        </button>
      </hstack>
    </vstack>
  );
};
