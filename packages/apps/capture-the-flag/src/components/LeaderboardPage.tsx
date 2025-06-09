import { Devvit } from '@devvit/public-api';

import { Page } from '../types/page.js';
import { Leaderboard } from '../types/state.js';
import { IconButton } from './IconButton.js';
import { LeaderboardRow } from './LeaderboardRow.js';

export interface LeaderboardPageProps {
  setPage: (page: Page) => void;
  openUserPage: (username: string) => void | Promise<void>;
  leaderboard: Leaderboard;
  currentUserName: string | undefined;
  gameActive: boolean;
}

export const LeaderboardPage = (props: LeaderboardPageProps): JSX.Element => {
  const { setPage, leaderboard, currentUserName, gameActive, openUserPage } = props;
  return (
    <vstack width="100%" height="100%" alignment="center" padding="medium" gap="medium">
      {/* Header */}
      <hstack width="100%" alignment="middle">
        <text color="white" weight="bold" size="xlarge" overflow="ellipsis" grow>
          {gameActive ? 'Leaderboard' : 'Game Over'}
        </text>
        <spacer size="medium" />
        {gameActive ? <IconButton icon="close" onPress={() => setPage('flag')} /> : null}
      </hstack>

      {/* Leaderboard */}
      <vstack gap="small" width="100%">
        {leaderboard.map((user) => (
          <LeaderboardRow
            rank={user.rank}
            name={user.name}
            score={user.score}
            isCurrentUser={user.name === currentUserName}
            onPress={() => openUserPage(user.name)}
          />
        ))}
      </vstack>
    </vstack>
  );
};
