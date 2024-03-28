import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';

interface PointsToastProps {
  value: number;
}

export const PointsToast = (props: PointsToastProps): JSX.Element => {
  const { value } = props;

  return (
    <hstack cornerRadius="full" padding="small" backgroundColor="white">
      <hstack
        alignment="middle center"
        backgroundColor="#F2C94C"
        grow={false}
        padding="medium"
        gap="medium"
      >
        <PixelText scale={4}>{`+ ${formatNumberWithCommas(value)}`}</PixelText>
        <PixelSymbol scale={4} type="star" />
      </hstack>
    </hstack>
  );
};
