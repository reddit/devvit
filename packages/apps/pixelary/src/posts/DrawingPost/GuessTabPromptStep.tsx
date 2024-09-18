import type { Context } from '@devvit/public-api';
import { Devvit, useForm } from '@devvit/public-api';
import { Drawing } from '../../components/Drawing.js';
import type { PostData } from '../../types/PostData.js';
import Settings from '../../settings.json';
import { StyledButton } from '../../components/StyledButton.js';
import { PixelText } from '../../components/PixelText.js';
import { abbreviateNumber } from '../../utils/abbreviateNumber.js';

interface GuessTabPromptStepProps {
  data: {
    postData: PostData;
    username: string | null;
  };
  onGuess: (word: string) => Promise<void>;
  feedback: boolean | null;
}

export const GuessTabPromptStep = (
  props: GuessTabPromptStepProps,
  context: Context
): JSX.Element => {
  const playerCount = props.data.postData.count.players;
  const winnerCount = props.data.postData.count.winners;
  const winPercentage =
    winnerCount > 0 && playerCount > 0 ? Math.round((winnerCount / playerCount) * 100) : 0;

  // Guess the word form
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
      await props.onGuess(guess);
    }
  );

  return (
    <vstack grow alignment="center">
      <spacer height="24px" />
      <zstack alignment="center middle">
        <Drawing data={props.data.postData.data} />
        {props.feedback === false && (
          <image
            url={'feedback-incorrect.png'}
            imageHeight={512}
            imageWidth={512}
            height="256px"
            width="256px"
          />
        )}
      </zstack>
      <spacer height="20px" />
      <PixelText
        color={Settings.theme.primary}
      >{`${abbreviateNumber(playerCount)} player${playerCount === 1 ? '' : 's'} tried`}</PixelText>
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
};
