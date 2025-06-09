import { Devvit } from '@devvit/public-api';

import { formatDurationFull } from '../utils.js';

export type LeaderboardRowProps = {
  rank: number;
  name: string;
  score: number;
  isCurrentUser?: boolean;
  onPress?: () => void | Promise<void>;
};

export const LeaderboardRow = (props: LeaderboardRowProps) => {
  const { rank, name, score, onPress, isCurrentUser } = props;
  const isDistinguished = rank <= 3;

  return (
    <hstack
      backgroundColor="rgba(255, 255, 255, 0.1)"
      cornerRadius="small"
      height="40px"
      width="100%"
      alignment="middle"
      onPress={onPress}
    >
      <spacer size="small" />
      <text color="rgba(255,255,255,0.7)" selectable={false}>{`${rank}.`}</text>
      <spacer size="xsmall" />
      <text weight="bold" color="white" grow overflow="ellipsis" selectable={false}>
        {`${name}${isCurrentUser ? ' (you)' : ''}`}
      </text>
      <spacer size="small" />
      <text color="white" selectable={false}>
        {formatDurationFull(score)}
      </text>
      <spacer size="small" />
      {isDistinguished && (
        <>
          <image
            url={`distinction-rank-${rank}.png`}
            imageHeight={48}
            imageWidth={48}
            width="24px"
            height="24px"
          />
          <spacer size="small" />
        </>
      )}
    </hstack>
  );
};
