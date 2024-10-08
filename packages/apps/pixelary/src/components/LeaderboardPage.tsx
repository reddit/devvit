import type { Context } from '@devvit/public-api';
import { Devvit, useAsync } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import Settings from '../settings.json';
import type { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';
import { LeaderboardRow } from './LeaderboardRow.js';
import { PixelText } from './PixelText.js';
import { StyledButton } from './StyledButton.js';

const Layout = (props: { children: JSX.Element; onClose: () => void }): JSX.Element => (
  <vstack width="100%" height="100%">
    <spacer height="24px" />
    <hstack width="100%" alignment="middle">
      <spacer width="24px" />
      <PixelText scale={2.5} color={Settings.theme.primary}>
        Leaderboard
      </PixelText>
      <spacer grow />
      <StyledButton
        appearance="primary"
        label="x"
        width="32px"
        height="32px"
        onPress={props.onClose}
      />
      <spacer width="20px" />
    </hstack>
    <spacer height="24px" />

    <hstack grow>
      <spacer width="24px" />
      <zstack alignment="start top" grow>
        {/* Shadow */}
        <vstack width="100%" height="100%">
          <spacer height="4px" />
          <hstack grow>
            <spacer width="4px" />
            <hstack grow backgroundColor={Settings.theme.shadow} />
          </hstack>
        </vstack>

        {/* Card */}
        <vstack width="100%" height="100%">
          <hstack grow>
            <vstack grow backgroundColor="white">
              <spacer height="4px" />
              {props.children}
              <spacer height="4px" />
            </vstack>
            <spacer width="4px" />
          </hstack>
          <spacer height="4px" />
        </vstack>
      </zstack>
      <spacer width="20px" />
    </hstack>

    <spacer height="20px" />
  </vstack>
);

interface LeaderboardPageProps {
  username: string | null;
  onClose: () => void;
}

const rowCount = 10;
const availableHeight = 418;
const dividerHeight = 10;

export const LeaderboardPage = (props: LeaderboardPageProps, context: Context): JSX.Element => {
  const { data, loading } = useAsync(
    async (): Promise<{
      scores: ScoreBoardEntry[];
      scoreBoardUser: {
        rank: number;
        score: number;
      };
    }> => {
      const service = new Service(context);
      try {
        const [scoreBoardUser, scores] = await Promise.all([
          service.getScoreBoardUserEntry(props.username),
          // Keep in sync with rowCount in ScoresTab.tsx
          service.getScoreBoard(10),
        ]);

        return {
          scores: Array.isArray(scores) ? scores : [],
          scoreBoardUser: scoreBoardUser || { rank: 0, score: 0 },
        };
      } catch (error) {
        return {
          scores: [],
          scoreBoardUser: {
            rank: 0,
            score: 0,
          },
        };
      }
    },
    {
      depends: [props.username],
    }
  );

  // Return early view if data is loading
  if (loading || data === null) {
    return (
      <Layout onClose={props.onClose}>
        <vstack grow alignment="center middle">
          <PixelText color={Settings.theme.secondary}>Loading ...</PixelText>
        </vstack>
      </Layout>
    );
  }

  const isUserInTheTop = data.scoreBoardUser.rank < rowCount;
  const rowHeight = isUserInTheTop
    ? `${(availableHeight - dividerHeight) / rowCount}px`
    : `${availableHeight / rowCount}px`;

  const numberOfScoresToInclude = !loading && data?.scoreBoardUser && isUserInTheTop ? 10 : 9;

  const leaderboardRows = data.scores.map((row, index) => {
    if (index >= numberOfScoresToInclude) {
      return null;
    }
    return (
      <LeaderboardRow
        rank={index + 1}
        height={rowHeight}
        name={row.member}
        score={row.score}
        onPress={() => context.ui.navigateTo(`https://reddit.com/u/${row.member}`)}
      />
    );
  });

  const footer = (
    <>
      {/* Divider */}
      <vstack>
        <spacer height="4px" />
        <hstack>
          <spacer width="12px" />
          <hstack grow height="2px" backgroundColor={Settings.theme.shadow} />
          <spacer width="12px" />
        </hstack>
        <spacer height="4px" />
      </vstack>

      {/* User */}
      <LeaderboardRow
        rank={data?.scoreBoardUser ? data.scoreBoardUser.rank : 0}
        height={rowHeight}
        name={props.username || 'Unknown'}
        score={data?.scoreBoardUser ? data.scoreBoardUser.score : 0}
        onPress={() => context.ui.navigateTo(`https://reddit.com/u/${props.username}`)}
      />
    </>
  );

  return (
    <Layout onClose={props.onClose}>
      {leaderboardRows}
      {/* Append the user to the bottom if they are out of view */}
      {!isUserInTheTop && footer}
    </Layout>
  );
};
