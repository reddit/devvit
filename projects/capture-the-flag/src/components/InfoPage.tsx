import { Devvit } from '@devvit/public-api';
import { Page } from '../types/page.js';
import { IconButton } from './IconButton.js';
import { AUTO_DROP_INTERVAL_MINUTES } from '../config.js';

export interface InfoPageProps {
  setPage: (page: Page) => void;
}

export const InfoPage = (props: InfoPageProps): JSX.Element => {
  const { setPage } = props;
  return (
    <vstack width="100%" height="100%" alignment="center" padding="medium" gap="medium">
      {/* Header */}
      <hstack width="100%" alignment="middle">
        <text color="white" weight="bold" size="xlarge" overflow="ellipsis" grow>
          How to play
        </text>
        <spacer size="medium" />
        <IconButton icon="close" onPress={() => setPage('flag')} />
      </hstack>

      {/* How to play */}
      <vstack gap="medium" width="100%">
        <text color="white" wrap width="100%">
          The goal of the game is to hold the flag for the longest total duration. All players have
          10 capture attempts, but after each successful claim, a hidden 5-20 second cooldown is
          triggered. During this cooldown, all capture attempts will fail but still deduct an
          attempt. After {AUTO_DROP_INTERVAL_MINUTES} minutes in one hands the flag will be dropped
          automatically and you will need to capture it again.
        </text>
        <text color="white" wrap width="100%">
          Outwit your opponents by mastering the timing of captures and cooldowns.
        </text>
      </vstack>
    </vstack>
  );
};
