import { Devvit, Context } from '@devvit/public-api';
import { Drawing } from '../../components/Drawing.js';
import { PostData } from '../../types/PostData.js';
import Settings from '../../settings.json';
import { Service } from '../../service/Service.js';
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
  username: string;
  feedback: boolean;
  setFeedback: (feedback: boolean) => void;
  feedbackDuration: number;
  setFeedbackDuration: (duration: number) => void;
  pointsEarned: number;
  setPointsEarned: (points: number) => void;
  isSolvedByUser: boolean;
  setIsSolvedByUser: (isSolved: boolean) => void;
  isSolved: boolean;
  isAuthor: boolean;
}

export const ViewerPage = (props: ViewerPageProps, context: Context): JSX.Element => {
  const {
    setPage,
    postData,
    username,
    feedback,
    setFeedback,
    feedbackDuration,
    setFeedbackDuration,
    pointsEarned,
    setPointsEarned,
    isSolvedByUser,
    setIsSolvedByUser,
    isSolved,
    isAuthor,
  } = props;
  const { postId, userId, useForm, ui, useInterval, redis, reddit } = context;
  const { word, data, author, authorId, date }: PostData = postData;

  const timeLeft = new Date(date).getTime() + Settings.postLiveSpan - Date.now();
  const postIsExpired = timeLeft < 0;
  const service = new Service(redis);
  const scoreMultiplier = getScoreMultiplier(date);
  const points = Settings.guesserPoints * scoreMultiplier;
  const feedbackTimer = useInterval(feedbackEnd, feedbackDuration);

  function feedbackStart() {
    setFeedback(true);
    feedbackTimer.start();
  }

  function feedbackEnd() {
    setFeedback(false);
    feedbackTimer.stop();
  }

  async function validateGuess(guess: string) {
    const formattedGuess = guess.toUpperCase();
    if (formattedGuess === word.toUpperCase()) {
      await service
        .handleDrawingSolvedEvent(postId!, author!, userId!, username!, date)
        .then(async (firstSolver) => {
          console.log('Drawing solved event handled');
          setFeedbackDuration(2000);
          feedbackStart();
          setIsSolvedByUser(true);
          setPointsEarned(points);
          if (firstSolver) {
            reddit.submitComment({
              id: postId!,
              text: `${username} is the first to solve this drawing!`,
            });

            const authorSettings = await service.getUserSettings(authorId!);
            if (authorSettings.drawingGuessed) {
              const post = await reddit.getPostById(postId!);
              const url = post.permalink;
              reddit.sendPrivateMessage({
                to: author,
                subject: 'Pixelary: Your drawing was solved!',
                text: `[u/${username}](https://reddit.com/u/${username}) just solved your [drawing of "${formattedGuess}"](${url}). You earned ${formatNumberWithCommas(
                  Settings.drawerPoints
                )} points. Great job!`,
              });
            }
          }
        })
        .catch((err) => {
          console.log(err);
          ui.showToast('Something went wrong with saving the drawing solved event');
        });
    } else {
      setFeedbackDuration(3000);
      feedbackStart();
      service.saveIncorrectGuess(guess.toLowerCase());
    }
  }

  const form = useForm(
    {
      title: 'Guess the word',
      acceptLabel: 'Guess',
      fields: [
        {
          type: 'string',
          name: 'guess',
          label: 'Word',
          helpText: 'A single, case insensitive word',
          required: true,
        },
      ],
    },
    async (values) => {
      const guess = values.guess.trim();
      await validateGuess(guess);
    }
  );

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
        <hstack gap="small" alignment="center">
          <PixelSymbol type="clock" />
          <PixelText>{postIsExpired ? 'Ended' : `${formatDuration(timeLeft)} left`}</PixelText>
        </hstack>

        <spacer size="large" />

        <zstack alignment="center middle">
          <Drawing data={data} />
          {feedback && !isSolvedByUser && (
            <image
              url={'feedback-incorrect.png'}
              imageHeight={512}
              imageWidth={512}
              height="256px"
              width="256px"
            />
          )}
          {feedback && isSolvedByUser && <PointsToast value={pointsEarned} />}
        </zstack>

        <spacer size="large" />

        {!postIsExpired && !isSolvedByUser && !isAuthor && (
          <vstack alignment="center">
            <StyledButton width="256px" label="GUESS THE WORD" onPress={() => ui.showForm(form)} />
            <spacer size="small" />
          </vstack>
        )}

        {isAuthor && <PixelText>You drew this!</PixelText>}

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

      <hstack width="100%" alignment="end" padding="large">
        <StyledIconButton icon="leaderboard" onPress={() => setPage('leaderboard')} />
      </hstack>
    </zstack>
  );
};
