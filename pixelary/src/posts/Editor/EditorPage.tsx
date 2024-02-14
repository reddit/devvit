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
  drawingTimer: UseIntervalResult;
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
    drawingTimer,
    currentColor,
    setCurrentColor,
  } = props;
  const size = 284;
  const sizeInPixels: Devvit.Blocks.SizeString = `${size / Settings.resolution}px`;

  const pixels = data.map((pixel, index) => (
    <hstack
      onPress={() => {
        const newData = data;
        newData[index] = currentColor;
        setData(newData);
      }}
      height={sizeInPixels}
      width={sizeInPixels}
      backgroundColor={Settings.colors[pixel]}
    />
  ));

  const grid = (
    <vstack cornerRadius="small" border="thick" borderColor="black" height="288px" width="288px">
      {splitArray(pixels, Settings.resolution).map((row) => (
        <hstack>{row}</hstack>
      ))}
    </vstack>
  );

  const colorPalette = (
    <hstack>
      {Settings.colors.map((c, i) => (
        <>
          <Shadow height="29px" width="29px">
            <hstack
              height="29px"
              width="29px"
              padding="small"
              cornerRadius="small"
              backgroundColor={c}
              border="thick"
              borderColor="black"
              alignment="center middle"
              onPress={() => {
                setCurrentColor(i);
              }}
            >
              {currentColor === i && (
                <PixelSymbol type="checkmark" color={c === '#FFFFFF' ? 'black' : 'white'} />
              )}
            </hstack>
          </Shadow>
          {i !== Settings.colors.length - 1 && <spacer width="4px" />}
        </>
      ))}
    </hstack>
  );

  drawingTimer.start();

  return (
    <vstack width="100%" height="100%" alignment="center top" padding="large">
      {/* Header */}
      <vstack width="100%" gap="small" alignment="center">
        <hstack width="100%" alignment="middle">
          <PixelText scale={3}>{word}</PixelText>
          <spacer grow />
          <StyledButton
            width="80px"
            label="DONE"
            onPress={() => {
              drawingTimer.stop();
              setPage('review');
            }}
          />
        </hstack>
        <hstack width="100%" alignment="center middle" gap="small">
          <PixelSymbol type="clock" />
          <PixelText>{drawingCountdown.toString()}</PixelText>
          <PixelText>{`second${drawingCountdown === 1 ? '' : 's'} left`}</PixelText>
        </hstack>
      </vstack>
      <spacer grow />
      <Shadow height="288px" width="288px">
        {grid}
      </Shadow>
      <spacer grow />
      {colorPalette}
    </vstack>
  );
};
