import { Devvit, useInterval, useState } from '@devvit/public-api';

import Settings from '../settings.json';
import type { CandidateWord } from '../types.js';
import { PixelSymbol } from './PixelSymbol.js';
import { PixelText } from './PixelText.js';

interface EditorPageWordStepProps {
  candidates: CandidateWord[];
  onNext: (candidateIndex: number, selectionEventType: 'refresh' | 'manual' | 'auto') => void;
  onRefreshCandidates: () => void;
}

export const EditorPageWordStep = (props: EditorPageWordStepProps): JSX.Element => {
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedtime] = useState(0);
  const timer = useInterval(() => {
    setElapsedtime(Date.now() - startTime);
    if (elapsedTime > Settings.cardDrawDuration * 1000) {
      // Timer is up
      props.onNext(0, 'auto');
    }
  }, 900);

  timer.start();

  const secondsLeft = Math.round(Settings.cardDrawDuration - elapsedTime / 1000);

  const options = props.candidates.map((candidate, index) => (
    <zstack
      alignment="start top"
      height="33.33%"
      width="288px"
      onPress={() => props.onNext(index, 'manual')}
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
        <hstack onPress={props.onRefreshCandidates}>
          <PixelSymbol scale={3} type="undo" color={Settings.theme.secondary} />
          <spacer width="4px" />
        </hstack>
      </hstack>

      <spacer height="24px" />
    </vstack>
  );
};
