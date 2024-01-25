import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';

interface PointsPillProps {
  value: number;
  onPress?: () => void;
}

export const PointsPill = (props: PointsPillProps): JSX.Element => {
  const { value, onPress } = props;

  return (
    <hstack
      alignment="middle center"
      cornerRadius="full"
      height="32px"
      onPress={onPress}
      backgroundColor="white"
      grow={false}
    >
      <spacer width="12px" />
      <PixelText>{formatNumberWithCommas(value)}</PixelText>
      <spacer size="small" />
      <PixelSymbol type="star" />
      <spacer width="12px" />
    </hstack>
  );
};
