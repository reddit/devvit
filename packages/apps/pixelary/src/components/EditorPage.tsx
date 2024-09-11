import { Devvit, useState } from '@devvit/public-api';
import Settings from '../settings.json';
import { splitArray } from '../utils/splitArray.js';
import { StyledButton } from './StyledButton.js';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import { Shadow } from './Shadow.js';
import type { Page } from '../types/Page.js';

interface EditorPageProps {
  word: string;
  setPage: (page: Page) => void;
  data: number[];
  setData: (data: number[]) => void;
  drawingCountdown: number;
  cancelDrawingTimer: () => void;
  fallbackTimerUpdate: () => void;
}

export const EditorPage = (props: EditorPageProps): JSX.Element => {
  const {
    word,
    setPage,
    data,
    setData,
    drawingCountdown,
    cancelDrawingTimer,
    fallbackTimerUpdate,
  } = props;
  const [currentColor, setCurrentColor] = useState<number>(1);

  const size = '275px';
  const innerSize = 275;
  const pixelSize: Devvit.Blocks.SizeString = `${innerSize / Settings.resolution}px`;

  const pixels = data.map((pixel, index) => (
    <hstack
      onPress={() => {
        const newData = data;
        newData[index] = currentColor;
        setData(newData);
        fallbackTimerUpdate();
      }}
      height={pixelSize}
      width={pixelSize}
      backgroundColor={Settings.colors[pixel]}
    />
  ));

  const grid = (
    <vstack height={size} width={size} padding="none">
      {splitArray(pixels, Settings.resolution).map((row) => (
        <hstack>{row}</hstack>
      ))}
    </vstack>
  );

  const colorPalette = (
    <hstack>
      {Settings.colors.map((c, i) => (
        <>
          <Shadow height="27.25px" width="27.25px">
            <hstack height="27.25px" width="27.25px" padding="xsmall" backgroundColor="black">
              <hstack
                height="100%"
                width="100%"
                backgroundColor={c}
                alignment="center middle"
                onPress={() => {
                  setCurrentColor(i);
                  fallbackTimerUpdate();
                }}
              >
                {currentColor === i && (
                  <PixelSymbol type="checkmark" color={c === '#FFFFFF' ? 'black' : 'white'} />
                )}
              </hstack>
            </hstack>
          </Shadow>
          {i !== Settings.colors.length - 1 && <spacer size="xsmall" />}
        </>
      ))}
    </hstack>
  );

  const drawingIsBlank = !data.some((value) => value !== -1);

  return (
    <vstack width="100%" height="100%" alignment="center top" padding="large">
      {/* Header */}
      <hstack width="100%" alignment="middle">
        <vstack alignment="top start">
          <PixelText scale={3}>{word}</PixelText>
          <spacer size="small" />
          <hstack alignment="middle" gap="small">
            <PixelSymbol type="clock" />
            <PixelText>{drawingCountdown.toString()}</PixelText>
            <PixelText>s left</PixelText>
          </hstack>
        </vstack>

        <spacer grow />

        <StyledButton
          width="80px"
          label="DONE"
          onPress={() => {
            cancelDrawingTimer();
            setPage('review');
          }}
        />
      </hstack>

      <spacer grow />
      <Shadow height={size} width={size}>
        <zstack height={size} width={size} alignment="middle center" backgroundColor="white">
          <image
            imageHeight={512}
            imageWidth={512}
            height={size}
            width={size}
            url="grid-template.png"
          />
          {drawingIsBlank && <PixelText color="#B2B2B2">Tap to draw</PixelText>}
          {grid}
        </zstack>
      </Shadow>
      <spacer grow />
      {colorPalette}
    </vstack>
  );
};
