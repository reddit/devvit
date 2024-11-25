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
  const service = new Service(context);

  const { data, loading } = useAsync<{
    leaderboard: ScoreBoardEntry[];
    user: {
      rank: number;
      score: number;
    };
  }>(async () => {
    try {
      return {
        leaderboard: await service.getScores(10),
        user: await service.getUserScore(props.username),
      };
    } catch (error) {
      if (error) {
        console.error('Error loading leaderboard data', error);
      }
      return {
        leaderboard: [],
        user: { rank: -1, score: 0 },
      };
    }
  });

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

  const isUserInTheTop = data.user.rank < rowCount;
  const rowHeight = isUserInTheTop
    ? `${(availableHeight - dividerHeight) / rowCount}px`
    : `${availableHeight / rowCount}px`;

  const numberOfScoresToInclude = !loading && data?.user && isUserInTheTop ? 10 : 9;

  const leaderboardRows = data.leaderboard.map((row, index) => {
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
        rank={data.user.rank}
        height={rowHeight}
        name={props.username ?? 'Unknown'}
        score={data.user.score}
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
