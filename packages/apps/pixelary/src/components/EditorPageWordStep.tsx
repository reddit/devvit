import { Devvit, useInterval, useState } from '@devvit/public-api';

import Settings from '../settings.json';
import type { CandidateWord } from '../types/CandidateWord.js';
import type { Dictionary } from '../types/Dictionary.js';
import { PixelSymbol } from './PixelSymbol.js';
import { PixelText } from './PixelText.js';

interface EditorPageWordStepProps {
  dictionaries: Dictionary[];
  onNext: (candidateWord: CandidateWord) => void;
}

/**
 * Shuffles an array of words using the Fisher-Yates algorithm. Uses i-- to ensure each element is swapped only once, moving backward.
 * (Math.random() * (i + 1)) limits the random index to unshuffled elements so no previously shuffled elements are reswapped.
 *
 * @param words List of words to shuffle.
 * @returns string[] Shuffled list.
 */

function shuffle(words: string[]) {
  const shuffledWords = [...words];
  for (let i = shuffledWords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
  }
  return shuffledWords;
}

const generateCandidateWords = (dictionaries: Dictionary[]): CandidateWord[] => {
  const candidates: CandidateWord[] = [];
  const isTakeoverActive = dictionaries.length > 1;
  dictionaries.forEach((dictionary) => {
    const isMainDictionary = dictionary.name === 'main';
    const shuffledWords = shuffle(dictionary.words);
    const count = isMainDictionary ? (isTakeoverActive ? 2 : 3) : 1;
    const words = shuffledWords.slice(0, Math.min(shuffledWords.length, count));
    words.forEach((word) => {
      candidates.push({
        dictionaryName: dictionary.name,
        word,
      });
    });
  });
  return candidates;
};

export const EditorPageWordStep = (props: EditorPageWordStepProps): JSX.Element => {
  const [candidateWords, setCandidateWords] = useState<CandidateWord[]>(() =>
    generateCandidateWords(props.dictionaries)
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

  const options = candidateWords.map((candidate, index) => (
    <zstack
      alignment="start top"
      height="33.33%"
      width="288px"
      onPress={() => props.onNext(candidate)}
    >
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
            <vstack grow width="100%" backgroundColor="white" alignment="center middle">
              <hstack>
                {index === 0 && (
                  <>
                    <PixelSymbol scale={2} type="arrow-right" color={Settings.theme.orangered} />
                    <spacer width="12px" />
                  </>
                )}
                <PixelText scale={2}>{candidate.word}</PixelText>
                {index === 0 && (
                  <>
                    <spacer width="12px" />
                    <PixelSymbol scale={2} type="arrow-left" color={Settings.theme.orangered} />
                  </>
                )}
              </hstack>
              {candidate.dictionaryName !== 'main' && (
                <>
                  <spacer height="8px" />
                  <PixelText scale={1.5} color={Settings.theme.tertiary}>
                    {candidate.dictionaryName}
                  </PixelText>
                </>
              )}
            </vstack>
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
        <hstack onPress={() => setCandidateWords(() => generateCandidateWords(props.dictionaries))}>
          <PixelSymbol scale={3} type="undo" color={Settings.theme.secondary} />
          <spacer width="4px" />
        </hstack>
      </hstack>

      <spacer height="24px" />
    </vstack>
  );
};
