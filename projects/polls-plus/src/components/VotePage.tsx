import { Devvit } from '@devvit/public-api';
import { PageType, PollProps } from '../PollModels.js';
import { KeyType, isStringValid, key, userKey } from '../PollHelpers.js';
import moment from 'moment';

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
    <hstack
      alignment={'start middle'}
      onPress={selectOption}
      gap={'small'}
      padding={'small'}
      data-selection={index}
    >
      <icon name={selected ? 'radio-button-fill' : 'radio-button-outline'} />
      <text>{option}</text>
    </hstack>
  );
};

export const VotePage: Devvit.BlockComponent<PollProps> = async (
  {
    options,
    votes,
    setVotes,
    navigate,
    optionsPerPollPage,
    pollPages,
    remainingMillis,
    description,
    allowShowResults,
  },
  { redis, useState, userId, postId }
) => {
  const remaining = moment.duration(remainingMillis).humanize();
  const [selectedOption, setSelectedOption] = useState(-1);

  const submitVote: Devvit.Blocks.OnPressEventHandler = async () => {
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
      await tx.set(user, selectedOption + '');
      await redis.incrBy(`polls:${postId}:${selectedOption}`, 1);
      await tx.exec();
      setVotes(votes.map((v, i) => (i === selectedOption ? v + 1 : v)));
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
    <vstack gap="none" padding="medium" grow>
      <hstack grow alignment="middle">
        <vstack alignment="middle">
          <hstack>
            <text style="heading" color="green">
              Open
            </text>
            <text style="body">&nbsp;· {remaining} left</text>
          </hstack>
        </vstack>
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
      {isStringValid(description) && (
        <>
          <spacer size="small" />
          <text style="metadata">{description}</text>
        </>
      )}
      <spacer size="small" />
      <hstack border="thin"></hstack>
      <vstack gap="small" grow>
        {options.slice(rangeStart, rangeEnd).map((option, index) => {
          const props = {
            option,
            index: index + rangeStart,
            selectedOption,
            setSelectedOption,
          };
          return <PollOption {...props} />;
        })}
      </vstack>
      <spacer grow />
      <hstack grow gap="medium" alignment="middle">
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
      <spacer size="small" />
    </vstack>
  );
};
