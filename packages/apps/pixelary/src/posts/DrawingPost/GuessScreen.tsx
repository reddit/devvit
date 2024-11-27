import type { Context } from '@devvit/public-api';
import { Devvit, useAsync, useForm } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { LoadingState } from '../../components/LoadingState.js';
import { PixelText } from '../../components/PixelText.js';
import { StyledButton } from '../../components/StyledButton.js';
import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';
import type { DrawingPostData } from '../../types/PostData.js';
import { PostGuesses } from '../../types/PostGuesses.js';
import { abbreviateNumber } from '../../utils/abbreviateNumber.js';

interface GuessScreenProps {
  postData: DrawingPostData;
  username: string | null;
  onGuess: (guess: string, userWantsToComment: boolean) => Promise<void>;
  onSkip: () => void;
  feedback: boolean | null;
}

export const GuessScreen = (props: GuessScreenProps, context: Context): JSX.Element => {
  const service = new Service(context);

  const { data, loading } = useAsync<PostGuesses>(async () => {
    const empty = { playerCount: 0, wordCount: 0, guessCount: 0, guesses: {} };
    if (!props.username) return empty;
    try {
      const players = await service.getPlayerCount(context.postId!);
      const metadata = await service.getPostGuesses(context.postId!);
      metadata.playerCount = players;
      return metadata;
    } catch (error) {
      if (error) {
        console.error('Error loading drawing meta data', error);
      }
      return empty;
    }
  });

  if (loading || data === null) return <LoadingState />;

  const playerCount = data?.playerCount || 0;
  const winnerCount = props.postData.solves;
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
          label: 'Leave a comment (optional)',
          defaultValue: false,
        },
      ],
    },
    async (values) => {
      const guess = values.guess.trim().toLowerCase();
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
      if (!props.postData.postId || !props.username) {
        return;
      }
      await service.skipPost(props.postData.postId, props.username);
      props.onSkip();
    }
  );

  const dictionaryName = props.postData.dictionaryName;

  return (
    <vstack height="100%" width="100%" alignment="center">
      <spacer height="24px" />
      {dictionaryName && dictionaryName !== 'main' && (
        <PixelText
          color={Settings.theme.secondary}
        >{`${dictionaryName} ${dictionaryName.startsWith('r/') ? 'takeover' : 'event'}`}</PixelText>
      )}
      <spacer grow />

      {/* Drawing */}
      <zstack alignment="center middle">
        <Drawing data={props.postData.data} size={width} />
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
