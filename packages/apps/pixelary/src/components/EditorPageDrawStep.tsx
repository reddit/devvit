import { Context, Devvit, useInterval, useState } from '@devvit/public-api';

import Settings from '../settings.json';
import type { CandidateWord } from '../types/CandidateWord.js';
import { UserData } from '../types/UserData.js';
import { blankCanvas } from '../utils/blankCanvas.js';
import { getLevel } from '../utils/progression.js';
import { splitArray } from '../utils/splitArray.js';
import { PixelSymbol } from './PixelSymbol.js';
import { PixelText } from './PixelText.js';
import { Shadow } from './Shadow.js';
import { StyledButton } from './StyledButton.js';

interface EditorPageDrawStepProps {
  username: string | null;
  userData: UserData;
  candidate: CandidateWord;
  onNext: (drawing: number[]) => void;
}

export const EditorPageDrawStep = (
  props: EditorPageDrawStepProps,
  _context: Context
): JSX.Element => {
  const [currentColor, setCurrentColor] = useState<number>(1);
  const [drawingData, setDrawingData] = useState<number[]>(blankCanvas);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const level = getLevel(props.userData.levelRank ?? 1);
  const drawingTime = Settings.drawingDuration + level.extraTime;

  useInterval(() => {
    setElapsedTime(Date.now() - startTime);
    const remainingTime = drawingTime * 1000 - elapsedTime;
    if (remainingTime <= 0) props.onNext(drawingData);
  }, 5000).start();

  const secondsLeft = Math.max(
    0, // Ensure non-negative value
    Math.round((drawingTime - elapsedTime / 1000) / 5) * 5 // Round to the nearest 5 seconds
  );

  const size = '275px';
  const innerSize = 275;
  const pixelSize: Devvit.Blocks.SizeString = `${innerSize / Settings.resolution}px`;

  const pixels = drawingData.map((pixel, index) => (
    <hstack
      onPress={() => {
        const newData = drawingData;
        newData[index] = currentColor;
        setDrawingData(newData);
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

  const drawingIsBlank = !drawingData.some((value) => value !== -1);

  return (
    <vstack width="100%" height="100%" alignment="center top" padding="large">
      {/* Header */}
      <hstack width="100%" alignment="middle">
        <vstack alignment="top start">
          <PixelText scale={3}>{props.candidate.word}</PixelText>
          <spacer size="small" />
          <hstack alignment="middle" gap="small">
            <PixelSymbol type="clock" />
            <PixelText>{secondsLeft.toString()}</PixelText>
            <PixelText>s left</PixelText>
          </hstack>
        </vstack>

        <spacer grow />

        <StyledButton
          width="80px"
          label="DONE"
          onPress={() => {
            props.onNext(drawingData);
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
          {drawingIsBlank && <PixelText color={Settings.theme.weak}>Tap to draw</PixelText>}
          {grid}
        </zstack>
      </Shadow>
      <spacer grow />
      {colorPalette}
    </vstack>
  );
};
