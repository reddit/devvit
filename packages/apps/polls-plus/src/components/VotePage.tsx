import { Devvit } from '@devvit/public-api';
import moment from 'moment';

import { key, KeyType, userKey } from '../PollHelpers.js';
import { PageType, PollProps } from '../PollModels.js';

// const props = { option, index, selectedOption, setSelectedOption }
export const PollOption = ({
  option,
  index,
  selectedOption,
  setSelectedOption,
}: {
  option: string;
  index: number;
  selectedOption: number;
  setSelectedOption: (n: number) => void;
}): JSX.Element => {
  const selectOption = (): void => setSelectedOption(index);
  const selected = index === selectedOption;
  return (
    <vstack>
      <spacer size="small" />
      <hstack
        width="100%"
        alignment={'start middle'}
        onPress={selectOption}
        gap={'small'}
        data-selection={index}
      >
        <icon name={selected ? 'radio-button-fill' : 'radio-button-outline'} />
        <text grow>{option}</text>
      </hstack>
    </vstack>
  );
};

export const VotePage: Devvit.BlockComponent<PollProps> = (
  {
    options,
    shuffledOptions,
    votes,
    setVotes,
    navigate,
    optionsPerPollPage,
    pollPages,
    remainingMillis,
    allowShowResults,
    randomizeOrder,
  },
  { redis, useState, userId, postId }
) => {
  const remaining = moment.duration(remainingMillis).humanize();
  const [selectedOption, setSelectedOption] = useState(-1);
  const presentedOptions = randomizeOrder ? shuffledOptions : options;

  const submitVote: Devvit.Blocks.OnPressEventHandler = async () => {
    const user = userKey(userId, postId);
    const tx = await redis.watch(user);
    const selectedOptionString = presentedOptions[selectedOption];
    const optionIndex = options.indexOf(selectedOptionString);

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
      await tx.set(user, optionIndex + '');
      await redis.incrBy(`polls:${postId}:${optionIndex}`, 1);
      await tx.exec();
      setVotes(votes.map((v, i) => (i === optionIndex ? v + 1 : v)));
    }
    navigate(PageType.RESULTS);
  };

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
    <vstack height="100%" width="100%" padding="medium">
      <hstack height="15%" width="100%" alignment="middle">
        <text style="heading" color="green">
          Open
        </text>
        <text style="body">&nbsp;· {remaining} left</text>
        <spacer grow />
        {
          allowShowResults && (
            <button appearance="plain" onPress={() => navigate(PageType.CONFIRM)}>
              View Results
            </button>
          )
          // <><text color='alienblue-500' onPress={() => navigate(PageType.CONFIRM)}>View Results</text></>
        }
      </hstack>
      <spacer size="xsmall" />
      <hstack border="thin"></hstack>
      <vstack grow>
        <spacer size="small" />
        <vstack gap="medium">
          {presentedOptions.slice(rangeStart, rangeEnd).map((option, index) => {
            const props = {
              option,
              index: index + rangeStart,
              selectedOption,
              setSelectedOption,
            };
            return <PollOption {...props} />;
          })}
        </vstack>
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
        <spacer grow />
        <button
          size="medium"
          appearance="primary"
          onPress={submitVote}
          disabled={selectedOption === -1}
        >
          Vote!
        </button>
      </hstack>
    </vstack>
  );
};
