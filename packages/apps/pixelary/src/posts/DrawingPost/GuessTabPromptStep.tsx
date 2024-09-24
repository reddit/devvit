import type { Context } from '@devvit/public-api';
import { Devvit, useForm } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { PixelText } from '../../components/PixelText.js';
import { StyledButton } from '../../components/StyledButton.js';
import Settings from '../../settings.json';
import type { PostData } from '../../types/PostData.js';
import { abbreviateNumber } from '../../utils/abbreviateNumber.js';
import { Service } from '../../service/Service.js';

interface GuessTabPromptStepProps {
  data: {
    postData: PostData;
    username: string | null;
  };
  onGuess: (guess: string, userWantsToComment: boolean) => Promise<void>;
  onSkip: () => void;
  feedback: boolean | null;
}

export const GuessTabPromptStep = (
  props: GuessTabPromptStepProps,
  context: Context
): JSX.Element => {
  const service = new Service(context);
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
        {
          type: 'boolean',
          name: 'comment',
          label: "Leave a comment if you're the first to make that guess.",
          defaultValue: true,
        },
      ],
    },
    async (values) => {
      const guess = values.guess.trim();
      const userWantsToComment = values.comment;
      await props.onGuess(guess, userWantsToComment);
    }
  );

  // Give up form
  const giveUpForm = useForm(
    {
      title: 'Giving up already?',
      description:
        "You'll see the word and lose your chance to earn points. Ready to call it quits?",
      acceptLabel: 'I Give Up',
      cancelLabel: 'Back',
      fields: [],
    },
    async () => {
      if (!props.data.postData.postId || !props.data.username) {
        return;
      }
      await service.skipPost(props.data.postData.postId, props.data.username);
      props.onSkip();
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

      {/* Footer */}
      <hstack alignment="center" width="100%">
        <StyledButton
          width="138px"
          label="GIVE UP"
          appearance="secondary"
          onPress={() => context.ui.showForm(giveUpForm)}
        />
        <spacer width="8px" />
        <StyledButton width="138px" label="GUESS" onPress={() => context.ui.showForm(guessForm)} />
      </hstack>

      <spacer height="20px" />
    </vstack>
  );
};
