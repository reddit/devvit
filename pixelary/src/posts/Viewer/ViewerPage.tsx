import { Devvit, Context, FormKey } from '@devvit/public-api';
import { Drawing } from '../../components/Drawing.js';
import { PostData } from '../../types/PostData.js';
import Settings from '../../settings.json';
import { formatDuration } from '../../utils/formatDuration.js';
import { StyledButton } from '../../components/StyledButton.js';
import { StyledIconButton } from '../../components/StyledIconButton.js';
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
  const { data, date }: PostData = postData;

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
        {/* Header */}
        <hstack width="100%" alignment="middle">
          <hstack gap="small">
            <PixelSymbol type="clock" />
            <PixelText>{postIsExpired ? 'Ended' : `${formatDuration(timeLeft)}`}</PixelText>
          </hstack>
          <spacer grow />
          <StyledIconButton icon="leaderboard" onPress={() => setPage('leaderboard')} />
        </hstack>

        <spacer size="large" grow />

        <zstack alignment="center middle">
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
              width="256px"
              label="GUESS THE WORD"
              onPress={() => ui.showForm(guessForm)}
            />
            <spacer size="small" />
          </vstack>
        )}

        {isAuthor && (
          <vstack>
            <PixelText>You drew this!</PixelText>
            <spacer size="small" />
          </vstack>
        )}

        {!postIsExpired && !isAuthor && !isSolvedByUser && (
          <hstack gap="small">
            <PixelText>{`For ${formatNumberWithCommas(points)}`}</PixelText>
            <PixelSymbol type="star" />
            <PixelText>{`(${scoreMultiplier}x)`}</PixelText>
          </hstack>
        )}

        {!isAuthor && isSolvedByUser && (
          <hstack gap="small">
            <PixelText>Solved for</PixelText>
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

        {isAuthor && !isSolved && (
          <hstack gap="small">
            <PixelText>{`Get ${formatNumberWithCommas(Settings.drawerPoints)}`}</PixelText>
            <PixelSymbol type="star" />
            <PixelText>if guessed</PixelText>
          </hstack>
        )}
      </vstack>
    </zstack>
  );
};
