import { Devvit } from '@devvit/public-api';
import Settings from '../settings.json';
import { generateRandomArray } from '../utils/generateRandomArray.js';
import { splitArray } from '../utils/splitArray.js';
import { Shadow } from './Shadow.js';

interface DrawingProps {
  data?: number[];
  size?: number;
  onPress?: () => void;
}

export const Drawing = (props: DrawingProps): JSX.Element => {
  const dummyData = generateRandomArray(Settings.resolution * Settings.resolution);
  const { data = dummyData, size = 256, onPress } = props;
  const borderSize = 4;
  const pixelSize: Devvit.Blocks.SizeString = `${(size - borderSize) / Settings.resolution}px`;

  const pixels = data.map((pixel, _index) => (
    <hstack height={pixelSize} width={pixelSize} backgroundColor={Settings.colors[pixel]} />
  ));

  const height: Devvit.Blocks.SizeString = `${size}px`;
  const width: Devvit.Blocks.SizeString = `${size}px`;

  const grid = (
    <Shadow width={width} height={height}>
      <vstack
        width={width}
        height={height}
        onPress={onPress}
        cornerRadius="small"
        border="thick"
        borderColor="black"
        backgroundColor="white"
      >
        {splitArray(pixels, Settings.resolution).map((row) => (
          <hstack>{row}</hstack>
        ))}
      </vstack>
    </Shadow>
  );

  return grid;
};
