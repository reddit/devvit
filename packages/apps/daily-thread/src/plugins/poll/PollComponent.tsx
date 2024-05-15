import { Devvit } from '@devvit/public-api';
import type { Poll } from './Poll.js';

export type PollComponentProps = {
  poll: Poll;
  voteAction: (option: string) => Promise<void>;
};

export const PollComponent: Devvit.BlockComponent<PollComponentProps> = ({ poll, voteAction }) => {
  return (
    <hstack width={'100%'} grow alignment="start middle">
      <vstack
        height={'100%'}
        width={'40px'}
        backgroundColor={'Mintgreen-200'}
        alignment="center top"
      >
        <spacer size="small" />
        <icon name={'predictions'} color="black" />
      </vstack>
      <vstack
        height={'100%'}
        backgroundColor="neutral-background-weak"
        padding="small"
        alignment="start top"
        grow
      >
        <text style="metadata" size="small">
          {poll.title}
        </text>
        <spacer size="xsmall" />
        <hstack width={'100%'} gap="small" alignment="start middle">
          {poll.options.map(([option, votes]) => (
            <button
              appearance="bordered"
              size="small"
              disabled={poll.voted}
              onPress={() => voteAction(option)}
            >
              {option} ({votes})
            </button>
          ))}
        </hstack>
      </vstack>
    </hstack>
  );
};
