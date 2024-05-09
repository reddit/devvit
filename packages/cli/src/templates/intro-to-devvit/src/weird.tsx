import { Devvit } from '@devvit/public-api';

const colors = [
  '#FFFFFF',
  '#000000',
  '#EB5757',
  '#F2994A',
  '#F2C94C',
  '#27AE60',
  '#2F80ED',
  '#9B51E0',
];

export type WeirdProps = {
  activeColor: number;
  setActiveColor: (activeColor: number) => void;
  data: number[];
  setData: (data: number[]) => void;
  isNormal: boolean;
  setIsNormal: (isNormal: boolean) => void;
  customColor: string;
};

const resolution = 8;
const size = 32;

export const defaultColor = 1;
export const startingColors = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 4, 1, 4, 0, 0, 0, 0, 0, 4, 4, 4, 2, 4,
  4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

export const Weird = ({
  activeColor,
  setActiveColor,
  data,
  setData,
  isNormal,
  setIsNormal,
  customColor,
}: WeirdProps): JSX.Element => {
  const ColorSelector = (): JSX.Element => (
    <hstack width="100%" alignment="center">
      {/* nested hstack to negate grow */}
      <hstack border="thin" grow={false} cornerRadius="small">
        {colors.map((color, index) => (
          <hstack
            height={`${size}px`}
            width={`${size}px`}
            backgroundColor={color}
            onPress={() => setActiveColor(index)}
            alignment="middle center"
          >
            {activeColor === index && (
              <text color={index === 1 ? 'white' : 'black'} weight="bold" size="xxlarge">
                ✓
              </text>
            )}
          </hstack>
        ))}
      </hstack>
    </hstack>
  );

  const pixels = data.map((pixel, index) => (
    <hstack
      onPress={() => {
        const newData = data;
        newData[index] = activeColor;
        setData(newData);
      }}
      height={`${size}px`}
      width={`${size}px`}
      backgroundColor={colors[pixel]}
    />
  ));

  const gridSize = `${resolution * size}px`;

  function splitArray<T>(array: T[], segmentLength: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += segmentLength) {
      result.push(array.slice(i, i + segmentLength));
    }
    return result;
  }

  const Canvas = (): JSX.Element => (
    <vstack cornerRadius="small" border="thin" height={gridSize} width={gridSize}>
      {splitArray(pixels, resolution).map((row) => (
        <hstack>{row}</hstack>
      ))}
    </vstack>
  );

  return (
    <blocks>
      <zstack grow backgroundColor={customColor} padding="small">
        <vstack
          gap="small"
          width="100%"
          height="100%"
          alignment="center middle"
          backgroundColor={customColor}
        >
          <Canvas />
          <ColorSelector />
        </vstack>
        <vstack alignment="bottom end" onPress={() => setIsNormal(!isNormal)} width={'100%'}>
          <text size="small">🥚</text>
        </vstack>
      </zstack>
    </blocks>
  );
};
