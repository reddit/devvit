import { Devvit } from '@devvit/public-api';
import { Page } from '../types/page.js';
import { ClaimButton } from './ClaimButton.js';
import { IconButton } from './IconButton.js';
import { formatDurationRough } from '../utils.js';

export interface FlagPageProps {
  claimant: string | null | undefined;
  setPage: (page: Page) => void;
  isCurrentClaimant: boolean;
  isOnCooldown: boolean;
  claimTheFlag: () => void | Promise<void>;
  holdingDurationMs: number;
  attemptsLeft: number | undefined;
  debug_cooldown: number;
}

export const FlagPage = (props: FlagPageProps): JSX.Element => {
  const {
    claimant,
    setPage,
    isCurrentClaimant,
    isOnCooldown,
    claimTheFlag,
    holdingDurationMs,
    attemptsLeft,
  } = props;

  return (
    <vstack width="100%" height="100%" alignment="center" padding="medium">
      {/* Header */}
      <vstack width="100%" alignment="center">
        <text size="small" weight="bold" color="rgba(255,255,255,0.7)" selectable={false}>
          FLAG HELD BY
        </text>
        <text size="xxlarge" weight="bold" color="white" selectable={false}>
          {claimant ?? 'Nobody'}
        </text>
        <spacer size="xsmall" />
        <text size="large" color="white" selectable={false}>
          for {formatDurationRough(holdingDurationMs)}
        </text>
      </vstack>

      {/* Flag asset */}
      <image
        url={`flag-${isCurrentClaimant ? 'blue' : 'red'}${isOnCooldown ? '-cooldown' : ''}.png`}
        imageHeight={520}
        imageWidth={563}
        height="336px"
      />

      {/* Footer */}
      <vstack gap="medium" width="100%" alignment="center">
        <hstack gap="medium" width="100%" maxWidth="350px">
          <IconButton icon="info" onPress={() => setPage('info')} />
          <ClaimButton onPress={claimTheFlag} disabled={isCurrentClaimant || !attemptsLeft} />
          <IconButton icon="contest" onPress={() => setPage('leaderboard')} />
        </hstack>
        <text color="rgba(255,255,255,0.7)" selectable={false}>
          {attemptsLeft !== undefined ? `${attemptsLeft} attempts left` : ``}
        </text>
      </vstack>
    </vstack>
  );
};
