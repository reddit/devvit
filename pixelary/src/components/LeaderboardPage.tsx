import { Context, Devvit } from '@devvit/public-api';
import { LeaderboardRow } from './LeaderboardRow.js';
import { PageHeader } from './PageHeader.js';
import { LeaderboardEntry } from '../types/LeaderboardEntry.js';

interface LeaderboardPageProps {
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
}

export const LeaderboardPage = (props: LeaderboardPageProps, context: Context): JSX.Element => {
  const { onClose, leaderboard } = props;
  const { ui } = context;

  return (
    <vstack width="100%" height="100%" alignment="center" padding="large" gap="large">
      <PageHeader title="High Scores" onClose={onClose} />

      {/* Leaderboard */}
      <vstack gap="small" width="100%">
        {leaderboard.map((row, index) => (
          <LeaderboardRow
            rank={index + 1}
            name={row.member}
            score={row.score}
            onPress={() => ui.navigateTo(`https:/reddit.com/u/${row.member}`)}
          />
        ))}
      </vstack>
    </vstack>
  );
};
