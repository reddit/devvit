import { Devvit } from '@devvit/public-api';
import moment from 'moment';

import { formatCount } from '../PollHelpers.js';
import { PageType, PollProps } from '../PollModels.js';

type ResultProps = {
  option: string;
  votes: number;
  total: number;
  winner: boolean;
};

const PollResult = ({ option, votes, total, winner }: ResultProps): JSX.Element => {
  const percent = Math.max((votes / total) * 100, 0.2);

  const nice = formatCount(votes);

  const PercentBar = (): JSX.Element | false =>
    percent >= 0 && (
      <hstack
        cornerRadius="small"
        backgroundColor={winner ? 'upvote-background-disabled' : 'downvote-background-disabled'}
        width={percent}
        height={'100%'}
        alignment={'center middle'}
      >
        <vstack>
          <spacer shape="square" size="small" />
        </vstack>
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
    <zstack width={'100%'}>
      <PercentBar />
      <hstack padding="small" width="100%">
        <text weight="bold">{nice}</text>
        <spacer size="medium" />
        <text grow>{option}</text>
      </hstack>
    </zstack>
  );
};

export const ResultsPage: Devvit.BlockComponent<PollProps> = (
  {
    reset,
    finish,
    setFinish,
    options,
    optionsPerPollPage,
    pollPages,
    votes,
    total,
    remainingMillis,
    navigate,
  },
  { postId, useState }
) => {
  const remaining = moment.duration(remainingMillis).humanize();
  const max = Math.max(...votes);

  const zipped = options.map((option, index) => ({
    option,
    votes: votes[index],
    total,
    winner: votes[index] === max,
  }));
  zipped.sort((a, b) => b.votes - a.votes);
  const three = 3 * 60 * 1000;

  const [pollPage, setPollPage] = useState(1);
  const rangeStart = (pollPage - 1) * optionsPerPollPage;
  const rangeEnd = pollPage * optionsPerPollPage;

  const prevPollPage: Devvit.Blocks.OnPressEventHandler = async () => {
    if (pollPage > 1) {
      setPollPage(pollPage - 1);
    }
  };
  const nextPollPage: Devvit.Blocks.OnPressEventHandler = async () => {
    if (pollPage < pollPages) {
      setPollPage(pollPage + 1);
    }
  };

  return (
    <vstack width="100%" height="100%" padding="medium">
      {remainingMillis > 0 && (
        <hstack height="15%" width="100%" alignment="middle">
          <text style="heading" color="green">
            Open
          </text>
          <text style="body">&nbsp;· {remaining} left</text>
        </hstack>
      )}
      {remainingMillis <= 0 && (
        <hstack height="15%" width="100%" alignment="middle">
          <text style="heading">Closed</text>
          <text style="body">&nbsp;· {formatCount(total)} votes</text>
        </hstack>
      )}
      <spacer size="xsmall" />
      <hstack border="thin"></hstack>

      <vstack gap="small" grow>
        <spacer size="xsmall" />
        {zipped.slice(rangeStart, rangeEnd).map((props) => {
          return <PollResult {...props} />;
        })}
      </vstack>

      <hstack width="100%" height="15%" alignment="middle">
        {pollPages > 1 && (
          <hstack grow gap="medium" alignment="middle">
            <button
              size="small"
              icon="back-outline"
              onPress={prevPollPage}
              disabled={pollPage === 1}
            />
            <text>
              Page {pollPage} of {pollPages}
            </text>
            <button
              size="small"
              icon="forward-outline"
              onPress={nextPollPage}
              disabled={pollPage === pollPages}
            />
          </hstack>
        )}
      </hstack>

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
