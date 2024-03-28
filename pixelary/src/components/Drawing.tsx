import { Devvit } from '@devvit/public-api';
import Settings from '../settings.json';
import { generateRandomArray } from '../utils/generateRandomArray.js';
import { Shadow } from './Shadow.js';

interface DrawingProps {
  data?: number[];
  size?: number;
  onPress?: () => void;
}

export const Drawing = (props: DrawingProps): JSX.Element => {
  const dummyData = generateRandomArray(Settings.resolution * Settings.resolution);
  const { data = dummyData, size = 275, onPress } = props;
  const borderSize = 4;
  const height: Devvit.Blocks.SizeString = `${size - borderSize}px`;
  const width: Devvit.Blocks.SizeString = `${size - borderSize}px`;

  function indexToXY(index: number, resolution: number): { x: number; y: number } {
    return {
      x: index % resolution,
      y: Math.floor(index / resolution),
    };
  }

  return (
    <Shadow width={width} height={height} onPress={onPress}>
      <hstack width={width} height={height} backgroundColor="black" padding="none">
        <hstack width="100%" height="100%" backgroundColor="white">
          <image
            imageWidth={size}
            imageHeight={size}
            width="100%"
            height="100%"
            description="Drawing"
            resizeMode="fill"
            url={`data:image/svg+xml,
            <svg
              width="${Settings.resolution}"
              height="${Settings.resolution}"
              viewBox="0 0 ${Settings.resolution} ${Settings.resolution}"
              xmlns="http://www.w3.org/2000/svg"
            >
              ${data.map((pixel, index) => {
                const { x, y } = indexToXY(index, Settings.resolution);
                return `
                  <rect
                    x="${x}"
                    y="${y}"
                    width="1"
                    height="1"
                    fill="${Settings.colors[pixel] || '#ffffff'}"
                  />
                `;
              })}
            </svg>
          `}
          />
        </hstack>
      </hstack>
    </Shadow>
  );
};
