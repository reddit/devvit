import { Devvit } from '@devvit/public-api';
import Settings from '../settings.json';
import { generateRandomArray } from '../utils/generateRandomArray.js';

interface DrawingProps {
  data?: number[];
  size?: number;
  onPress?: () => void;
}

export const Drawing = (props: DrawingProps): JSX.Element => {
  const dummyData = generateRandomArray(Settings.resolution * Settings.resolution);
  const { data = dummyData, size = 288, onPress } = props;
  const shadowOffset = 4;
  const height: Devvit.Blocks.SizeString = `${size + shadowOffset}px`;
  const width: Devvit.Blocks.SizeString = `${size + shadowOffset}px`;

  function indexToXY(index: number, resolution: number): { x: number; y: number } {
    return {
      x: index % resolution,
      y: Math.floor(index / resolution),
    };
  }

  return (
    <zstack height={height} width={width} onPress={onPress}>
      {/* Shadow */}
      <vstack height={height} width={width}>
        <spacer height="4px" />
        <hstack grow>
          <spacer width="4px" />
          <hstack grow backgroundColor={Settings.theme.shadow} />
        </hstack>
      </vstack>

      {/* Card */}
      <vstack height={height} width={width}>
        <hstack grow>
          <image
            imageWidth={size}
            imageHeight={size}
            height={`${size}px`}
            width={`${size}px`}
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
          <spacer width="4px" />
        </hstack>
        <spacer height="4px" />
      </vstack>
    </zstack>
  );
};
