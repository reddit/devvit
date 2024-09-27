import type { Context } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { PixelText } from '../../components/PixelText.js';
import { PointsToast } from '../../components/PointsToast.js';
import { StyledButton } from '../../components/StyledButton.js';
import Settings from '../../settings.json';
import type { PostData } from '../../types/PostData.js';
import { abbreviateNumber } from '../../utils/abbreviateNumber.js';
import { obfuscateString } from '../../utils/obfuscateString.js';

interface DrawingPostResultsStepProps {
  data: {
    postData: PostData;
    username: string | null;
  };
  rows?: number;
  feedback: boolean | null;
  onDraw: () => void;
}

export const DrawingPostResultsStep = (
  props: DrawingPostResultsStepProps,
  context: Context
): JSX.Element => {
  const rowCount = props.rows || 6;
  const rowHeight: Devvit.Blocks.SizeString = `${100 / rowCount}%`;

  const data = props.data.postData;
  const playerCount = data.count.players;

  // Top N guesses (or whatever is available)
  const topGuesses = data.guesses
    .sort((a, b) => b.count - a.count)
    .slice(0, rowCount)
    .map((guess) => {
      const percentage = Math.round((guess.count / data.count.guesses) * 100);
      const word = guess.word.charAt(0).toUpperCase() + guess.word.slice(1);

      return (
        <zstack
          height={rowHeight}
          width="100%"
          alignment="top start"
          backgroundColor="rgba(255, 255, 255, 0.2)"
          onPress={async () => {
            if (!guess.commentId) return;
            const comment = await context.reddit.getCommentById(guess.commentId);
            context.ui.navigateTo(comment);
          }}
        >
          {/* Progress Bar */}
          <hstack width={`${percentage}%`} height="100%" backgroundColor="white" />
          {/* Guess */}
          <hstack height="100%" width="100%" alignment="start middle">
            <spacer width="12px" />
            <PixelText scale={2}>{guess.commentId ? word : obfuscateString(word)}</PixelText>
          </hstack>
          {/* Metadata */}
          <hstack height="100%" width="100%" alignment="end middle">
            <PixelText scale={1.5} color={Settings.theme.secondary}>
              {guess.count.toString()}
            </PixelText>
            <spacer width="12px" />
            <PixelText scale={2} color={Settings.theme.primary}>
              {`${percentage}%`}
            </PixelText>
            <spacer width="12px" />
          </hstack>
        </zstack>
      );
    });

  // Add placeholder rows if there are less guesses than rowCount
  const placeholderRows = Array.from({ length: rowCount - topGuesses.length }).map(
    (_value, _index) => (
      <zstack height={rowHeight} width="100%" backgroundColor="rgba(255, 255, 255, 0.2)" />
    )
  );

  return (
    <zstack height="100%" width="100%" alignment="center middle">
      <vstack height="100%" width="100%" alignment="center middle">
        <spacer height="24px" />

        {/* Header */}
        <hstack gap="medium" alignment="center middle">
          <Drawing size={64} data={data.data} />
          <vstack gap="small" alignment="start middle">
            <PixelText scale={2}>{data.word}</PixelText>
            <PixelText scale={1.5} color={Settings.theme.secondary}>
              {`By u/${data.authorUsername}`}
            </PixelText>
          </vstack>
        </hstack>
        <spacer height="24px" />

        {/* List */}
        <hstack width="100%" grow>
          <spacer width="24px" />
          <vstack grow gap="small">
            {topGuesses}
            {placeholderRows}
          </vstack>
          <spacer width="24px" />
        </hstack>
        <spacer height="24px" />

        {/* Metadata */}
        <PixelText
          scale={1.5}
          color={Settings.theme.secondary}
        >{`${abbreviateNumber(data.count.guesses)} guess${data.count.guesses === 1 ? '' : 'es'} by ${abbreviateNumber(playerCount)} player${playerCount === 1 ? '' : 's'}`}</PixelText>
        <spacer height="24px" />

        {/* Call to action */}
        <StyledButton
          leadingIcon="+"
          label="DRAW"
          onPress={() => props.onDraw()}
          width="128px"
          height="32px"
        />
        <spacer height="20px" />
      </vstack>

      {/* Feedback */}
      {props.feedback === true && <PointsToast value={Settings.pointsPerGuess} />}
    </zstack>
  );
};
