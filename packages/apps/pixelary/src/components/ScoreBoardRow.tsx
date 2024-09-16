import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';
import Settings from '../settings.json';

export type ScoreBoardRowProps = {
  rank: number;
  name: string;
  height: Devvit.Blocks.SizeString;
  score: number;
  onPress?: () => void;
};

export const ScoreBoardRow = (props: ScoreBoardRowProps): JSX.Element => {
  const { rank, name, height, score, onPress } = props;

  return (
    <zstack height={height} onPress={onPress}>
      <hstack width="100%" height="100%" alignment="start middle">
        <spacer width="12px" />
        <PixelText color={Settings.theme.secondary}>{`${rank}.`}</PixelText>
        <spacer width="8px" />
        <PixelText color={Settings.theme.primary}>{name}</PixelText>
      </hstack>

      {/* Score partially overlaps name if screen is too narrow */}
      <hstack width="100%" height="100%" alignment="end middle">
        <image
          url="gradient-transparent-to-white.png"
          imageHeight={1}
          imageWidth={32}
          height="100%"
          width="32px"
          resizeMode="fill"
        />
        <hstack backgroundColor="white" height="100%" alignment="middle">
          <spacer width="8px" />
          <PixelText color={Settings.theme.secondary}>{formatNumberWithCommas(score)}</PixelText>
          <spacer width="8px" />
          <PixelSymbol color={Settings.theme.secondary} type="star" />
          <spacer width="12px" />
        </hstack>
      </hstack>
    </zstack>
  );
};
