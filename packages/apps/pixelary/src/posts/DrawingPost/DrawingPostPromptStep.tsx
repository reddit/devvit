import type { Context } from '@devvit/public-api';
import { Devvit, useForm } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { PixelText } from '../../components/PixelText.js';
import { StyledButton } from '../../components/StyledButton.js';
import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';
import type { PostData } from '../../types/PostData.js';
import { abbreviateNumber } from '../../utils/abbreviateNumber.js';

interface DrawingPostPromptStepProps {
  data: {
    postData: PostData;
    username: string | null;
  };
  onGuess: (guess: string, userWantsToComment: boolean) => Promise<void>;
  onSkip: () => void;
  feedback: boolean | null;
}

export const DrawingPostPromptStep = (
  props: DrawingPostPromptStepProps,
  context: Context
): JSX.Element => {
  const service = new Service(context);
  const playerCount = props.data.postData.count.players;
  const winnerCount = props.data.postData.count.winners;
  const winPercentage =
    winnerCount > 0 && playerCount > 0 ? Math.round((winnerCount / playerCount) * 100) : 0;

  const maxWidth = 304; // If larger, it will cause vertical overflow.
  const minWidth = 256;
  const margin = 24;
  // Calculate the width of the drawing, but keep it within the min and max width.
  const width = context.dimensions
    ? Math.max(minWidth, Math.min(maxWidth, context.dimensions.width - margin - margin))
    : minWidth;

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

  const dictionaryName = props.data.postData.dictionaryName;

  return (
    <vstack height="100%" width="100%" alignment="center">
      <spacer height="24px" />
      {dictionaryName && dictionaryName !== 'main' && (
        <PixelText color={Settings.theme.secondary}>{`${dictionaryName} takeover`}</PixelText>
      )}
      <spacer grow />

      {/* Drawing */}
      <zstack alignment="center middle">
        <Drawing data={props.data.postData.data} size={width} />
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
      <spacer grow />

      {/* Metadata */}
      <PixelText
        color={Settings.theme.primary}
      >{`${abbreviateNumber(playerCount)} player${playerCount === 1 ? '' : 's'} tried`}</PixelText>
      {playerCount > 0 && (
        <>
          <spacer height="4px" />
          <PixelText color={Settings.theme.secondary}>{`${winPercentage}% got it right`}</PixelText>
        </>
      )}

      <spacer grow />

      {/* Footer */}
      <StyledButton
        width={`${width}px`}
        height="32px"
        label="GUESS THE WORD"
        appearance="primary"
        onPress={() => context.ui.showForm(guessForm)}
      />
      <spacer width="8px" />
      <StyledButton
        width={`${width}px`}
        height="32px"
        label="GIVE UP"
        appearance="secondary"
        onPress={() => context.ui.showForm(giveUpForm)}
      />
      <spacer height="20px" />
    </vstack>
  );
};
