import { Devvit, UseIntervalResult } from '@devvit/public-api';
import Settings from '../../settings.json';
import { splitArray } from '../../utils/splitArray.js';
import { StyledButton } from '../../components/StyledButton.js';
import { PixelText } from '../../components/PixelText.js';
import { PixelSymbol } from '../../components/PixelSymbol.js';
import { Shadow } from '../../components/Shadow.js';
import { editorPages } from './editorPages.js';

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
  const size = 275;
  const sizeInPixels: Devvit.Blocks.SizeString = `${size / Settings.resolution}px`;

  const pixels = data.map((pixel, index) => (
    <hstack
      onPress={() => {
        const newData = data;
        newData[index] = currentColor;
        setData(newData);
        fallbackTimerUpdate();
      }}
      height={sizeInPixels}
      width={sizeInPixels}
      backgroundColor={Settings.colors[pixel]}
    />
  ));

  const grid = (
    <vstack cornerRadius="small" border="thick" borderColor="black" height="275px" width="275px">
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
              padding="small"
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

  return (
    <vstack width="100%" height="100%" alignment="center top" padding="large">
      {/* Header */}
      <hstack width="100%" alignment="middle">
        <vstack>
          <PixelText scale={3}>{word}</PixelText>
          <spacer size="xsmall" />
          <hstack width="100%" alignment="center middle" gap="small">
            <PixelSymbol type="clock" />
            <PixelText>{drawingCountdown.toString()}</PixelText>
            <PixelText>s</PixelText>
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
      <Shadow height="275px" width="275px">
        {grid}
      </Shadow>
      <spacer grow />
      {colorPalette}
    </vstack>
  );
};
