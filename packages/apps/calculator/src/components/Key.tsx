import { Devvit } from '@devvit/public-api';
import type { KeyValue, OnKeyPress } from '../types.js';
import { keyValueLabel } from '../types.js';

const UNIT_SIZE = 48;
const GAP_SIZE = 8;

type KeyProps = {
  value: KeyValue;
  width: number;
  height: number;
  onPress?: OnKeyPress | undefined;
};

export const Key: Devvit.BlockComponent<KeyProps> = ({ value, width, height, onPress }) => {
  const label = keyValueLabel(value);

  return (
    <vstack
      alignment="top center"
      width={`${width * UNIT_SIZE + (width - 1) * GAP_SIZE}px`}
      height={`${height * UNIT_SIZE + (height - 1) * GAP_SIZE}px`}
      padding="small"
      cornerRadius="small"
      border="thin"
      onPress={onPress ? () => onPress(value) : undefined}
    >
      <text weight="bold" selectable={false}>
        {label}
      </text>
    </vstack>
  );
};
