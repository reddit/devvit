import { Devvit, useInterval, useState } from '@devvit/public-api';

import { PixelSymbol } from './PixelSymbol.js';
import { PixelText } from './PixelText.js';
import Settings from '../settings.json';

interface EditorPageWordStepProps {
  onNext: (word: string) => void;
  currentDictionary: string[];
}

/**
 * Shuffles an array of words using the Fisher-Yates algorithm. Uses i-- to ensure each element is swapped only once, moving backward.
 * (Math.random() * (i + 1)) limits the random index to unshuffled elements so no previously shuffled elements are reswapped.
 * Limits the result to N words or less based on the number of available words
 *
 * @param words List of words to shuffle.
 * @param N Number of words to return (default is 3).
 * @returns string[] Shuffled list limited to N words.
 */

const generateCandidateWords = (words: string[], N: number = 3): string[] => {
  const shuffledWords = [...words];
  for (let i = shuffledWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }
  return shuffledWords.slice(0, Math.min(shuffledWords.length, N));
};

export const EditorPageWordStep = (props: EditorPageWordStepProps): JSX.Element => {
  const [candidateWords, setCandidateWords] = useState<string[]>(() =>
    generateCandidateWords(props.currentDictionary)
  );

  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedtime] = useState(0);
  const timer = useInterval(() => {
    setElapsedtime(Date.now() - startTime);
    if (elapsedTime > Settings.cardDrawDuration * 1000) {
      // Timer is up
      props.onNext(candidateWords[0]);
    }
  }, 900);

  timer.start();

  const secondsLeft = Math.round(Settings.cardDrawDuration - elapsedTime / 1000);

  const options = candidateWords.map((word, index) => (
    <zstack alignment="start top" height="33.33%" width="288px" onPress={() => props.onNext(word)}>
      {/* Shadow */}
      <vstack width="100%" height="100%">
        <spacer size="xsmall" />
        <hstack width="100%" grow>
          <spacer size="xsmall" />
          <hstack height="100%" grow backgroundColor={Settings.theme.shadow} />
        </hstack>
      </vstack>

      {/* Card */}
      <vstack width="100%" height="100%">
        <hstack width="100%" grow>
          <vstack grow height="100%" padding="xsmall" backgroundColor="black">
            <hstack grow width="100%" backgroundColor="white" alignment="center middle">
              {index === 0 && (
                <>
                  <PixelSymbol scale={2} type="arrow-right" color={Settings.theme.orangered} />
                  <spacer width="12px" />
                </>
              )}
              <PixelText scale={2}>{word}</PixelText>
              {index === 0 && (
                <>
                  <spacer width="12px" />
                  <PixelSymbol scale={2} type="arrow-left" color={Settings.theme.orangered} />
                </>
              )}
            </hstack>
          </vstack>
          <spacer size="xsmall" />
        </hstack>

        <spacer size="xsmall" />
      </vstack>
    </zstack>
  ));

  return (
    <vstack width="100%" grow alignment="center">
      <spacer height="24px" />
      <PixelText scale={3}>Pick a word</PixelText>
      <spacer height="24px" />

      {/* Cards */}
      <hstack width="100%" grow>
        <spacer width="24px" />
        <vstack gap="small" height="100%" grow alignment="center">
          {options}
        </vstack>
        <spacer width="24px" />
      </hstack>

      <spacer height="24px" />

      {/* Countdown timer */}
      <hstack width="288px" alignment="middle">
        <spacer width="19px" />

        <spacer grow />
        <PixelSymbol scale={3} type="arrow-right" color={Settings.theme.tertiary} />
        <spacer width="12px" />
        <PixelText color="#000000" scale={3}>
          {secondsLeft.toString()}
        </PixelText>
        <spacer width="12px" />
        <PixelSymbol scale={3} type="arrow-left" color={Settings.theme.tertiary} />
        <spacer grow />
        <hstack
          onPress={() => setCandidateWords(() => generateCandidateWords(props.currentDictionary))}
        >
          <PixelSymbol scale={3} type="undo" color={Settings.theme.secondary} />
          <spacer width="4px" />
        </hstack>
      </hstack>

      <spacer height="24px" />
    </vstack>
  );
};
