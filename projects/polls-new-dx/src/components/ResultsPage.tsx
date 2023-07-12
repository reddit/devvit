/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { Devvit } from '@devvit/public-api';

import moment from 'moment';

import { PageType, PollProps, formatCount } from '../main.js';

type ResultProps = {
  option: string;
  votes: number;
  total: number;
  winner: boolean;
};

const PollResult = ({ option, votes, total, winner }: ResultProps) => {
  const percent = (votes / total) * 100;

  const nice = formatCount(votes);

  const PercentBar = () =>
    percent > 0 && (
      <hstack
        cornerRadius="small"
        backgroundColor={winner ? 'orangered' : 'silver'}
        width={percent}
        alignment={'center middle'}
      >
        <spacer shape="square" size="small" />
      </hstack>
    );

  if (!option && !votes) {
    return (
      <vstack>
        <text color={'transparent'}>_</text>
        <hstack border={'thin'} borderColor={'transparent'}>
          <text color={'transparent'}>_</text>
        </hstack>
      </vstack>
    );
  }

  return (
    <vstack>
      <hstack padding="small">
        <text style="heading">{option}</text>
        <spacer />
        <text>{nice}</text>
      </hstack>
      <PercentBar />
    </vstack>
  );
};

export const ResultsPage: Devvit.BlockComponent<PollProps> = async ({ reset, finish, setFinish, options, votes, total, remainingMillis, navigate }, { postId }) => {
  const remaining = moment.duration(remainingMillis).humanize();
  const max = Math.max(...votes);
  const zipped = options.map((option, index) => ({
    option,
    votes: votes[index],
    total,
    winner: votes[index] == max,
  }));
  zipped.sort((a, b) => b.votes - a.votes);
  const three = 3 * 60 * 1000;

  return (
    <vstack gap="medium" padding="small">
      <hstack>
        <text style="heading">{remainingMillis > 0 ? 'Open' : 'Closed'}</text>
        <text>&nbsp;· {formatCount(total)} votes</text>
      </hstack>
      <hstack border="thin"></hstack>

      {zipped.map((props) => {
        return <PollResult {...props} />;
      })}

      {remainingMillis > 0 && <text>&nbsp;{remaining} left</text>}

      {!postId && ( // i.e. only in development mode.
        <vstack gap="medium">
          <text>Local debug panel</text>
          <hstack gap="medium">
            <button
              onPress={async () => {
                await reset();
                navigate(PageType.VOTE);
              }}
            >
              Reset
            </button>
            <button onPress={() => navigate(PageType.VOTE)}>Vote again</button>
            <button onPress={() => setFinish(finish + three)}>+3 minutes</button>
            <button onPress={() => setFinish(finish - three)}>-3 minutes</button>
          </hstack>
        </vstack>
      )}
    </vstack>
  );
};
