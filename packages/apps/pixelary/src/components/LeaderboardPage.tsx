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

      <zstack alignment="start top" width="100%" grow>
        {/* Shadow */}
        <vstack width="100%" height="100%">
          <spacer size="xsmall" />
          <hstack width="100%" height="100%">
            <spacer size="xsmall" />
            <hstack height="100%" width="100%" backgroundColor="rgba(0,0,0,0.2)" />
          </hstack>
        </vstack>

        {/* Card */}
        <vstack width="100%" height="100%">
          <hstack width="100%" grow>
            <vstack grow height="100%" backgroundColor="white">
              {scores.map((row, index) => (
                <LeaderboardRow
                  rank={index + 1}
                  name={row.member}
                  score={row.score}
                  onPress={() => ui.navigateTo(`https://reddit.com/u/${row.member}`)}
                />
              ))}
            </vstack>
            <spacer size="xsmall" />
          </hstack>
          <spacer size="xsmall" />
        </vstack>
      </zstack>
    </vstack>
  );
};
