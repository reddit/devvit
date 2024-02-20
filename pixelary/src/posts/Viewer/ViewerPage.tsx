import { Devvit, Context, FormKey } from '@devvit/public-api';
import { Drawing } from '../../components/Drawing.js';
import { PostData } from '../../types/PostData.js';
import Settings from '../../settings.json';
import { formatDuration } from '../../utils/formatDuration.js';
import { StyledButton } from '../../components/StyledButton.js';
import { getScoreMultiplier } from '../../utils/getScoreMultiplier.js';
import { PixelText } from '../../components/PixelText.js';
import { PixelSymbol } from '../../components/PixelSymbol.js';
import { PointsToast } from '../../components/PointsToast.js';
import { viewerPages } from './viewerPages.js';
import { formatNumberWithCommas } from '../../utils/formatNumbers.js';

interface ViewerPageProps {
  setPage: (page: viewerPages) => void;
  postData: PostData;
  showFeedback: boolean;
  pointsEarned: number;
  isSolvedByUser: boolean;
  isSolved: boolean;
  isAuthor: boolean;
  guessForm: FormKey;
}

export const ViewerPage = (props: ViewerPageProps, context: Context): JSX.Element => {
  const {
    setPage,
    postData,
    showFeedback,
    pointsEarned,
    isSolvedByUser,
    isSolved,
    isAuthor,
    guessForm,
  } = props;
  const { ui } = context;
  const { word, data, date }: PostData = postData;

  const timeLeft = new Date(date).getTime() + Settings.postLiveSpan - Date.now();
  const postIsExpired = timeLeft < 0;
  const scoreMultiplier = getScoreMultiplier(date);
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
          <PixelText>{postIsExpired ? 'Ended' : `${formatDuration(timeLeft)} left`}</PixelText>
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

        {!postIsExpired && !isSolvedByUser && !isAuthor && (
          <vstack alignment="center">
            <StyledButton
              width="275px"
              label="GUESS THE WORD"
              onPress={() => ui.showForm(guessForm)}
            />
            <spacer size="medium" />
          </vstack>
        )}

        {(isSolved || isAuthor || postIsExpired) && (
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

        {!postIsExpired && !isAuthor && !isSolvedByUser && (
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

        {(isSolved || postIsExpired || isAuthor) && (
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
