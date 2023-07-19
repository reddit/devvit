/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { Devvit } from '@devvit/public-api';
import { formatCount, PageType, PollProps } from '../main.js';
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
}) => {
  const selectOption = () => setSelectedOption(index);
  const selected = index === selectedOption;
  const bgColor = selected ? 'orangered' : 'white';
  return (
    <hstack
      alignment={'start middle'}
      onPress={selectOption}
      gap={'small'}
      padding={'small'}
      data-selection={index}
    >
      <hstack cornerRadius={'full'} border={'thin'} borderColor={'black'} backgroundColor={bgColor}>
        <spacer size={'medium'} />
        <vstack>
          <spacer size={'medium'} />
        </vstack>
      </hstack>
      <text>{option}</text>
    </hstack>
  );
};

export const VotePage: Devvit.BlockComponent<PollProps> = async (
  { options, votes, setVotes, total, navigate, remainingMillis },
  { redis, useState, userId, postId }
) => {
  const remaining = moment.duration(remainingMillis).humanize();

  const [selectedOption, setSelectedOption] = useState(-1);

  const submitVote: Devvit.Blocks.OnPressEventHandler = async () => {
    const userKey = `polls:${postId}:${userId}`;
    const tx = await redis.watch(userKey);
    let already = false;
    try {
      already = !!(await redis.get(userKey));
    } catch {
      // ignored
    }
    await tx.multi();
    await tx.zAdd(`polls:${postId}:voted`, { member: userKey, score: 0 });
    if (already) {
      await tx.exec();
    } else {
      await tx.set(userKey, selectedOption + '');
      await redis.incrBy(`polls:${postId}:${selectedOption}`, 1);
      await tx.exec();
      setVotes(votes.map((v, i) => (i == selectedOption ? v + 1 : v)));
    }
    navigate(PageType.RESULTS);
  };
  return (
    <vstack gap="medium" padding="small">
      <hstack>
        <text style="heading">Open</text>
        <text>&nbsp;· {formatCount(total)} votes</text>
      </hstack>
      <hstack border="thin"></hstack>

      {options.map((option, index) => {
        const props = {
          option,
          index,
          selectedOption,
          setSelectedOption,
        };
        return <PollOption {...props} />;
      })}

      <hstack>
        <button onPress={submitVote} disabled={selectedOption == -1}>
          Vote!
        </button>
        <vstack alignment="middle">
          <text>&nbsp;{remaining} left</text>
        </vstack>
      </hstack>
    </vstack>
  );
};
