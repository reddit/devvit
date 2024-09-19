import type { Context } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

import { PixelText } from '../../components/PixelText.js';
import { ScoreBoardRow } from '../../components/ScoreBoardRow.js';
import Settings from '../../settings.json';
import type { ScoreBoardEntry } from '../../types/ScoreBoardEntry.js';

const Wrapper = (props: { children: JSX.Element }): JSX.Element => (
  <vstack width="100%" grow>
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

interface ScoresTabProps {
  data: {
    username: string | null;
  };
  scoreBoardData: {
    scores: ScoreBoardEntry[];
    scoreBoardUser: {
      rank: number;
      score: number;
    };
  } | null;
  scoreBoardDataLoading: boolean;
}

const rowCount = 10;
const availableHeight = 418;
const dividerHeight = 10;

export const ScoresTab = (props: ScoresTabProps, context: Context): JSX.Element => {
  const { scoreBoardData, scoreBoardDataLoading } = props;

  // Return early view if data is loading
  if (scoreBoardDataLoading || scoreBoardData === null) {
    return (
      <Wrapper>
        <vstack grow alignment="center middle">
          <PixelText color={Settings.theme.secondary}>Loading ...</PixelText>
        </vstack>
      </Wrapper>
    );
  }

  const isUserInTheTop = scoreBoardData.scoreBoardUser.rank < rowCount;
  const rowHeight = isUserInTheTop
    ? `${(availableHeight - dividerHeight) / rowCount}px`
    : `${availableHeight / rowCount}px`;

  const numberOfScoresToInclude =
    !scoreBoardDataLoading && scoreBoardData?.scoreBoardUser && isUserInTheTop ? 10 : 9;

  const scoreBoardRows = scoreBoardData.scores.map((row, index) => {
    if (index >= numberOfScoresToInclude) {
      return null;
    }
    return (
      <ScoreBoardRow
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
      <ScoreBoardRow
        rank={scoreBoardData?.scoreBoardUser ? scoreBoardData.scoreBoardUser.rank : 0}
        height={rowHeight}
        name={props.data.username || 'Unknown'}
        score={scoreBoardData?.scoreBoardUser ? scoreBoardData.scoreBoardUser.score : 0}
        onPress={() => context.ui.navigateTo(`https://reddit.com/u/${props.data.username}`)}
      />
    </>
  );

  return (
    <Wrapper>
      {scoreBoardRows}
      {/* Append the user to the bottom if they are out of view */}
      {!isUserInTheTop && footer}
    </Wrapper>
  );
};
