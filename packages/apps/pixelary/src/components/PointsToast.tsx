import { Devvit } from '@devvit/public-api';

import Settings from '../settings.json';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';
import { PixelSymbol } from './PixelSymbol.js';
import { PixelText } from './PixelText.js';

interface PointsToastProps {
  value: number;
}

export const PointsToast = (props: PointsToastProps): JSX.Element => {
  const { value } = props;

  return (
    <vstack backgroundColor={Settings.theme.primary}>
      <spacer height="4px" />
      <hstack>
        <spacer width="4px" />
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
        <spacer width="4px" />
      </hstack>
      <spacer height="4px" />
    </vstack>
  );
};
