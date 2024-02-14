import { Devvit, Context, UseIntervalResult } from '@devvit/public-api';
import { editorPages } from './editorPages.js';
import { PixelText } from '../../components/PixelText.js';
import { PixelSymbol } from '../../components/PixelSymbol.js';
import { Shadow } from '../../components/Shadow.js';

interface CardDrawPageProps {
  word: string;
  setPage: (page: editorPages) => void;
  cardDrawCountdown: number;
  cardDrawTimer: UseIntervalResult;
}

export const CardDrawPage = (props: CardDrawPageProps): JSX.Element => {
  const { word, cardDrawCountdown, cardDrawTimer } = props;

  cardDrawTimer.start();

  const height: Devvit.Blocks.SizeString = '350px';
  const width: Devvit.Blocks.SizeString = '250px';

  return (
    <vstack width="100%" height="100%" alignment="center middle" gap="large">
      {/* Card */}
      <Shadow height={height} width={width}>
        <vstack
          height={height}
          width={width}
          cornerRadius="small"
          backgroundColor="white"
          border="thick"
          borderColor="black"
          alignment="center middle"
          gap="medium"
        >
          <PixelText>You are drawing</PixelText>
          <PixelText scale={3}>{word}</PixelText>
        </vstack>
      </Shadow>

      {/* Countdown timer */}
      <hstack gap="medium" alignment="middle">
        <PixelSymbol scale={3} type="arrow-right" color="rgba(0,0,0,0.3)" />
        <PixelText scale={3}>{cardDrawCountdown.toString()}</PixelText>
        <PixelSymbol scale={3} type="arrow-left" color="rgba(0,0,0,0.3)" />
      </hstack>
    </vstack>
  );
};
