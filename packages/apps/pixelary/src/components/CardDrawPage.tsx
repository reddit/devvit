import { Devvit } from '@devvit/public-api';
import type { pages } from '../types/pages.js';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import { Shadow } from './Shadow.js';

interface CardDrawPageProps {
  word: string;
  setPage: (page: pages) => void;
  cardDrawCountdown: number;
}

export const CardDrawPage = (props: CardDrawPageProps): JSX.Element => {
  const { word, cardDrawCountdown } = props;

  const height: Devvit.Blocks.SizeString = '350px';
  const width: Devvit.Blocks.SizeString = '250px';

  return (
    <vstack width="100%" height="100%" alignment="center middle" gap="large">
      {/* Card */}
      <Shadow height={height} width={width}>
        <vstack height={height} width={width} padding="none" backgroundColor="black">
          <vstack
            height="100%"
            width="100%"
            backgroundColor="white"
            alignment="center middle"
            gap="medium"
          >
            <PixelText>You are drawing</PixelText>
            <PixelText scale={3}>{word}</PixelText>
          </vstack>
        </vstack>
      </Shadow>

      {/* Countdown timer */}
      <hstack gap="medium" alignment="middle">
        <PixelSymbol scale={3} type="arrow-right" color="#ffffff" />
        <PixelText scale={3}>{cardDrawCountdown.toString()}</PixelText>
        <PixelSymbol scale={3} type="arrow-left" color="#ffffff" />
      </hstack>
    </vstack>
  );
};
