import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';
import Settings from '../settings.json';

export type LeaderboardRowProps = {
  rank: number;
  name: string;
  height: Devvit.Blocks.SizeString;
  score: number;
  onPress?: () => void;
};

export const LeaderboardRow = (props: LeaderboardRowProps): JSX.Element => {
  const { rank, name, height, score, onPress } = props;

  return (
    <zstack height={height} onPress={onPress}>
      {/* Name and rank */}
      <hstack width="100%" height="100%" alignment="start middle">
        <spacer width="12px" />
        <PixelText color={Settings.theme.tertiary}>{`${rank}.`}</PixelText>
        <spacer width="8px" />
        <PixelText color={Settings.theme.primary}>{name}</PixelText>
      </hstack>

      {/* Score */}
      {/* May overlap especially long names on narrow screens */}
      <hstack width="100%" height="100%" alignment="end middle">
        {/* Gradient for smooth transition */}
        <image
          url="gradient-transparent-to-white.png"
          imageHeight={1}
          imageWidth={32}
          height="100%"
          width="32px"
          resizeMode="fill"
        />
        {/* Background to cover long names */}
        <hstack backgroundColor="white" height="100%" alignment="middle">
          <spacer width="8px" />
          <PixelText color={Settings.theme.primary}>{formatNumberWithCommas(score)}</PixelText>
          <spacer width="8px" />
          <PixelSymbol color={Settings.theme.primary} type="star" />
          <spacer width="12px" />
        </hstack>
      </hstack>
    </zstack>
  );
};
