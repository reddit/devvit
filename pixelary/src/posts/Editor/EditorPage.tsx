import { Devvit } from '@devvit/public-api';
import Settings from '../../settings.json';
import { splitArray } from '../../utils/splitArray.js';
import { StyledButton } from '../../components/StyledButton.js';
import { PixelText } from '../../components/PixelText.js';
import { PixelSymbol } from '../../components/PixelSymbol.js';
import { Shadow } from '../../components/Shadow.js';
import type { editorPages } from './editorPages.js';

interface EditorPageProps {
  word: string;
  setPage: (page: editorPages) => void;
  data: number[];
  setData: (data: number[]) => void;
  drawingCountdown: number;
  cancelDrawingTimer: () => void;
  fallbackTimerUpdate: () => void;
  currentColor: number;
  setCurrentColor: (color: number) => void;
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
    currentColor,
    setCurrentColor,
  } = props;

  const size = '275px';
  const innerSize = 271;
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
    <vstack cornerRadius="small" border="thick" borderColor="black" height={size} width={size}>
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
            <hstack
              height="27.25px"
              width="27.25px"
              cornerRadius="small"
              backgroundColor={c}
              border="thick"
              borderColor="black"
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
        <zstack height={size} width={size} alignment="middle center" cornerRadius="small">
          <image
            imageHeight={512}
            imageWidth={512}
            height={`${innerSize}px`}
            width={`${innerSize}px`}
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
