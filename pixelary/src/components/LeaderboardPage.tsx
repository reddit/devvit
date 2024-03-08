import type { Context } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { LeaderboardRow } from './LeaderboardRow.js';
import { PageHeader } from './PageHeader.js';
import type { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';

interface LeaderboardPageProps {
  onClose: () => void;
  scores: ScoreBoardEntry[];
}

export const LeaderboardPage = (props: LeaderboardPageProps, context: Context): JSX.Element => {
  const { onClose, scores } = props;
  const { ui } = context;

  return (
    <vstack width="100%" height="100%" alignment="center" padding="large" gap="large">
      <PageHeader title="High Scores" description="Last 7 days" onClose={onClose} />

      {/* List of top N high scores */}
      <vstack gap="small" width="100%">
        {scores.map((row, index) => (
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
