import type { Context } from '@devvit/public-api';
import { Devvit, useAsync } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { LoadingState } from '../../components/LoadingState.js';
import { PixelText } from '../../components/PixelText.js';
import { PointsToast } from '../../components/PointsToast.js';
import { StyledButton } from '../../components/StyledButton.js';
import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';
import type { Dictionary } from '../../types/Dictionary.js';
import type { DrawingPostData } from '../../types/PostData.js';
import { abbreviateNumber } from '../../utils/abbreviateNumber.js';
import { capitalizeWord } from '../../utils/capitalizeWord.js';
import { obfuscateString } from '../../utils/obfuscateString.js';

function includesCaseInsensitive(array: string[], target: string): boolean {
  return array.some((item) => item.toLowerCase() === target.toLowerCase());
}

function dictionaryContainsWord(dictionaries: Dictionary[], word: string): boolean {
  return dictionaries.some((entry) => includesCaseInsensitive(entry.words, word));
}

interface ResultsScreenProps {
  postData: DrawingPostData;
  username: string | null;
  dictionaries: Dictionary[];
  feedback: boolean | null;
  pointsEarned?: number;
  onDraw: () => void;
}

export const ResultsScreen = (props: ResultsScreenProps, context: Context): JSX.Element => {
  const rowCount = 6;
  const rowHeight: Devvit.Blocks.SizeString = `${100 / rowCount}%`;
  const service = new Service(context);

  const { data, loading } = useAsync<{
    guesses: { [guess: string]: number };
    wordCount: number;
    guessCount: number;
    playerCount: number;
    comments: { [guess: string]: string[] };
  }>(async () => {
    const empty = { playerCount: 0, wordCount: 0, guessCount: 0, guesses: {}, comments: {} };
    if (!props.username) return empty;
    try {
      const playerCount = await service.getPlayerCount(context.postId!);
      const guesses = await service.getPostGuesses(context.postId!);
      const comments = await service.getGuessComments(context.postId!);
      return {
        playerCount,
        wordCount: guesses.wordCount,
        guessCount: guesses.guessCount,
        guesses: guesses.guesses,
        comments,
      };
    } catch (error) {
      if (error) {
        console.error('Error loading drawing meta data', error);
      }
      return empty;
    }
  });

  if (loading || data === null) return <LoadingState />;

  // Top N guesses (or whatever is available)
  const topGuesses = Object.entries(data.guesses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, rowCount)
    .map(([word, count]) => {
      const percentage = Math.round((count / data.guessCount) * 100);
      const isCorrect = word.toLowerCase() === props.postData.word.toLowerCase();
      const isInDictionary = dictionaryContainsWord(props.dictionaries, word);
      const isSafeToShow = data.comments[word] || isCorrect || isInDictionary;

      return (
        <zstack
          height={rowHeight}
          width="100%"
          alignment="top start"
          backgroundColor="rgba(255, 255, 255, 0.2)"
          onPress={async () => {
            if (!data.comments[word]) return;
            const comment = await context.reddit.getCommentById(data.comments[word][0]);
            context.ui.navigateTo(comment);
          }}
        >
          {/* Progress Bar */}
          <hstack width={`${percentage}%`} height="100%" backgroundColor="white" />
          {/* Guess */}
          <hstack height="100%" width="100%" alignment="start middle">
            <spacer width="12px" />
            <PixelText
              color={isSafeToShow ? Settings.theme.primary : Settings.theme.secondary}
              scale={2}
            >
              {isSafeToShow ? capitalizeWord(word) : obfuscateString(word)}
            </PixelText>
          </hstack>
          {/* Metadata */}
          <hstack height="100%" width="100%" alignment="end middle">
            <PixelText scale={1.5} color={Settings.theme.secondary}>
              {count.toString()}
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
          <Drawing size={64} data={props.postData.data} />
          <vstack gap="small" alignment="start middle">
            <PixelText scale={2}>{props.postData.word}</PixelText>
            <PixelText scale={1.5} color={Settings.theme.secondary}>
              {`By u/${props.postData.authorUsername}`}
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
        >{`${abbreviateNumber(data?.guessCount)} guess${data.guessCount === 1 ? '' : 'es'} by ${abbreviateNumber(data.playerCount)} player${data.playerCount === 1 ? '' : 's'}`}</PixelText>
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
      {/* TODO: Include firstSolve bonus check */}
      {props.feedback === true && (
        <PointsToast value={props.pointsEarned ?? Settings.guesserRewardForSolve} />
      )}
    </zstack>
  );
};
