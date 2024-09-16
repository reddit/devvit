import type { Context } from '@devvit/public-api';
import { Devvit, useForm, useState, useInterval } from '@devvit/public-api';
import { Drawing } from '../../components/Drawing.js';
import type { PostData } from '../../types/PostData.js';
import Settings from '../../settings.json';
import { StyledButton } from '../../components/StyledButton.js';
import { PixelText } from '../../components/PixelText.js';
import { PointsToast } from '../../components/PointsToast.js';
import { Service } from '../../service/Service.js';

interface GuessTabProps {
  data: {
    postData: PostData;
    username: string | null;
    subredditName: string;
  };
  onDraw: () => void;
  onScores: () => void;
}

export const GuessTab = (props: GuessTabProps, context: Context): JSX.Element => {
  const service = new Service(context.redis);

  /*
   * Guess feedback timer
   */

  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [feedbackDuration, setFeedbackDuration] = useState(Settings.feedbackDuration);
  const guessFeedbackTimer = useInterval(() => {
    if (feedbackDuration > 1) {
      setFeedbackDuration(feedbackDuration - 1);
    } else {
      setFeedback(null);
      guessFeedbackTimer.stop();
      setFeedbackDuration(Settings.feedbackDuration);
    }
  }, 100);

  /*
   * Guess validation
   */

  async function onValidateGuess(guess: string): Promise<void> {
    if (!props.data?.postData || !props.data?.username) {
      return;
    }
    const userGuessedCorrectly = guess.toLowerCase() === props.data.postData.word.toLowerCase();

    setFeedback(userGuessedCorrectly);
    guessFeedbackTimer.start();

    await service
      .handleGuessEvent({
        postId: props.data.postData.postId,
        authorUsername: props.data.postData.authorUsername,
        username: props.data.username,
        word: props.data.postData.word.toLowerCase(),
        guess: guess.toLowerCase(),
      })
      .then(async (firstToSolveDrawing) => {
        if (firstToSolveDrawing) {
          await context.reddit.submitComment({
            id: props.data.postData.postId,
            text: `${props.data.username} is the first to solve this drawing!`,
          });
        }
      });
  }

  /*
   * Guess form
   */

  const guessForm = useForm(
    {
      title: 'Guess the word',
      description: "If you're right, you'll earn 1 point.",
      acceptLabel: 'Submit Guess',
      fields: [
        {
          type: 'string',
          name: 'guess',
          label: 'Word',
          required: true,
        },
        // {
        //   type: 'boolean',
        //   name: 'comment',
        //   label: "Comment the word if you're first to make that guess",
        //   defaultValue: true,
        // },
      ],
    },
    async (values) => {
      const guess = values.guess.trim();
      await onValidateGuess(guess);
    }
  );

  const isSolvedByUser = props.data.postData.user.solved;
  const playerCount = props.data.postData.count.players;
  const winnerCount = props.data.postData.count.winners;
  const winPercentage =
    winnerCount > 0 && playerCount > 0 ? Math.round((winnerCount / playerCount) * 100) : 0;

  const guessView = (
    <vstack grow alignment="center">
      <spacer height="24px" />
      <zstack alignment="center middle">
        <Drawing data={props.data.postData.data} />
        {feedback === false && (
          <image
            url={'feedback-incorrect.png'}
            imageHeight={512}
            imageWidth={512}
            height="256px"
            width="256px"
          />
        )}
        {feedback === true && <PointsToast value={Settings.pointsPerGuess} />}
      </zstack>
      <spacer height="20px" />
      <PixelText
        color={Settings.theme.primary}
      >{`${playerCount} player${playerCount === 1 ? '' : 's'} tried`}</PixelText>
      <spacer height="4px" />
      <PixelText color={Settings.theme.secondary}>{`${winPercentage}% got it right`}</PixelText>
      <spacer grow />
      <StyledButton
        width="288px"
        label="GUESS THE WORD"
        onPress={() => context.ui.showForm(guessForm)}
      />
      <spacer height="24px" />
    </vstack>
  );

  const resultsView = (
    <vstack grow alignment="center middle">
      <PixelText color={Settings.theme.secondary}>Results list</PixelText>
    </vstack>
  );

  return isSolvedByUser ? resultsView : guessView;
};
