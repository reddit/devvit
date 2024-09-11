import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import type { Page } from '../types/Page.js';

interface CardDrawPageProps {
  candidateWords: string[];
  setWord: (word: string) => void;
  setPage: (page: Page) => void;
  cardDrawCountdown: number;
}

export const CardDrawPage = (props: CardDrawPageProps): JSX.Element => {
  const { candidateWords, setWord, setPage, cardDrawCountdown } = props;
  const width: Devvit.Blocks.SizeString = '275px';

  return (
    <vstack width="100%" height="100%" alignment="center middle" padding="large" gap="large">
      <PixelText scale={3}>Pick a word</PixelText>

      {/* Cards */}
      <vstack gap="small" grow width="100%" alignment="center">
        {candidateWords.map((candidateWord, index) => (
          <zstack
            alignment="start top"
            height="33.33%"
            width={width}
            onPress={() => {
              setWord(candidateWord);
              setPage('editor');
            }}
          >
            {/* Shadow */}
            <vstack width="100%" height="100%">
              <spacer size="xsmall" />
              <hstack width="100%" grow>
                <spacer size="xsmall" />
                <hstack height="100%" grow backgroundColor="rgba(0,0,0,0.2)" />
              </hstack>
            </vstack>

            {/* Card */}

            <vstack width="100%" height="100%">
              <hstack width="100%" grow>
                <vstack
                  grow
                  height="100%"
                  padding={index === 0 ? 'xsmall' : 'none'}
                  backgroundColor="black"
                >
                  <vstack
                    grow
                    width="100%"
                    backgroundColor="white"
                    alignment="center middle"
                    gap="medium"
                  >
                    <PixelText scale={3}>{candidateWord}</PixelText>
                  </vstack>
                </vstack>
                <spacer size="xsmall" />
              </hstack>

              <spacer size="xsmall" />
            </vstack>
          </zstack>
        ))}
      </vstack>

      {/* Countdown timer */}
      <hstack gap="medium" alignment="middle">
        <PixelSymbol scale={3} type="arrow-right" color="#000000" />
        <PixelText scale={3}>{cardDrawCountdown.toString()}</PixelText>
        <PixelSymbol scale={3} type="arrow-left" color="#000000" />
      </hstack>
    </vstack>
  );
};
