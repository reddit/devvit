import { Devvit } from '@devvit/public-api';

import Settings from '../settings.json';

interface ProgressBarProps {
  percentage: number;
  width: number;
}

export const ProgressBar = (props: ProgressBarProps): JSX.Element => {
  return (
    <zstack
      backgroundColor={Settings.theme.shadow}
      height="8px"
      width={`${props.width}px`}
      alignment="start middle"
    >
      <hstack
        backgroundColor={Settings.theme.orangered}
        height="100%"
        width={`${props.percentage}%`}
      />
    </zstack>
  );
};
