import type { Context, FormKey } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { Drawing } from '../../components/Drawing.js';
import type { PostData } from '../../types/PostData.js';
import Settings from '../../settings.json';
import { formatDuration } from '../../utils/formatDuration.js';
import { StyledButton } from '../../components/StyledButton.js';
import { getScoreMultiplier } from '../../utils/getScoreMultiplier.js';
import { PixelText } from '../../components/PixelText.js';
import { PixelSymbol } from '../../components/PixelSymbol.js';
import { PointsToast } from '../../components/PointsToast.js';
import type { viewerPages } from './viewerPages.js';
import { formatNumberWithCommas } from '../../utils/formatNumbers.js';

interface ViewerPageProps {
  setPage: (page: viewerPages) => void;
  postData: PostData;
  showFeedback: boolean;
  pointsEarned: number;
  isSolved: boolean;
  isAuthor: boolean;
  guessForm: FormKey;
}

export const ViewerPage = (props: ViewerPageProps, context: Context): JSX.Element => {
  const { setPage, postData, showFeedback, pointsEarned, isSolved, isAuthor, guessForm } = props;
  const { ui } = context;
  const { word, data, date, expired = false }: PostData = postData;

  const isSolvedByUser = pointsEarned > 0;

  const timeLeft = date + Settings.postLiveSpan - Date.now();
  const scoreMultiplier = getScoreMultiplier(Date.now());
  const points = Settings.guesserPoints * scoreMultiplier;

  return (
    <zstack width="100%" height="100%" alignment="top start">
      <image
        imageHeight={1024}
        imageWidth={1500}
        height="100%"
        width="100%"
        url="background.png"
        description="striped blue background"
        resizeMode="cover"
      />
      <vstack width="100%" height="100%" padding="large" alignment="center middle">
        {/* Time left */}
        <hstack gap="small">
          <PixelSymbol type="clock" />
          <PixelText>{expired ? 'Ended' : `${formatDuration(timeLeft)} left`}</PixelText>
        </hstack>

        <spacer size="small" />
        <spacer size="medium" />

        <zstack alignment="center middle" height="279px" width="279px">
          <Drawing data={data} />
          {showFeedback && !isSolvedByUser && (
            <image
              url={'feedback-incorrect.png'}
              imageHeight={512}
              imageWidth={512}
              height="256px"
              width="256px"
            />
          )}
          {showFeedback && isSolvedByUser && <PointsToast value={pointsEarned} />}
        </zstack>

        <spacer size="large" grow />

        {!expired && !isSolvedByUser && !isAuthor && (
          <vstack alignment="center">
            <StyledButton
              width="275px"
              label="GUESS THE WORD"
              onPress={() => ui.showForm(guessForm)}
            />
            <spacer size="medium" />
          </vstack>
        )}

        {(isAuthor || expired || isSolvedByUser) && (
          <vstack>
            <PixelText scale={3}>{word}</PixelText>
            <spacer size="xsmall" />
          </vstack>
        )}

        {isAuthor && !isSolved && (
          <vstack>
            <PixelText>You drew this!</PixelText>
          </vstack>
        )}

        {!expired && !isAuthor && !isSolvedByUser && (
          <hstack gap="small">
            <PixelText>{`For ${formatNumberWithCommas(points)}`}</PixelText>
            <PixelSymbol type="star" />
            <PixelText>{` (${scoreMultiplier}x)`}</PixelText>
          </hstack>
        )}

        {!isAuthor && isSolvedByUser && (
          <hstack gap="small">
            <PixelText>Earned</PixelText>
            <PixelText>{formatNumberWithCommas(pointsEarned)}</PixelText>
            <PixelSymbol type="star" />
          </hstack>
        )}

        {isAuthor && isSolved && (
          <hstack gap="small">
            <PixelText>Earned</PixelText>
            <PixelText>{formatNumberWithCommas(Settings.drawerPoints)}</PixelText>
            <PixelSymbol type="star" />
          </hstack>
        )}

        {(expired || isAuthor || isSolvedByUser) && (
          <vstack>
            <spacer size="small" />
            <spacer size="medium" />
            <StyledButton width="275px" label="SCORES" onPress={() => setPage('leaderboard')} />
          </vstack>
        )}
      </vstack>
    </zstack>
  );
};
