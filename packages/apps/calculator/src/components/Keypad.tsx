import { Devvit } from '@devvit/public-api';
import type { KeyValue, OnKeyPress } from '../types.js';
import { Op } from '../types.js';
import { Key } from './Key.js';

type KeypadProps = {
  onPress?: OnKeyPress | undefined;
};

export const Keypad: Devvit.BlockComponent<KeypadProps> = ({ onPress }) => {
  const toKey = (key: KeyValue): JSX.Element => {
    let width = 1;
    let height = 1;

    if (key === 0) {
      width = 2;
    }
    if (key === Op.ADD || key === Op.EQUALS) {
      height = 2;
    }

    return <Key value={key} width={width} height={height} onPress={onPress} />;
  };

  const toKeyRows = (row: KeyValue[]): JSX.Element => {
    return <hstack gap="small">{row.map(toKey)}</hstack>;
  };

  const topOps = [Op.CLEAR, Op.DIVIDE, Op.MULTIPLY].map(toKey);
  const numbers = [
    [7, 8, 9],
    [4, 5, 6],
    [1, 2, 3],
    [0, Op.DECIMAL],
  ].map(toKeyRows);
  const sideOps = [Op.SUBTRACT, Op.ADD, Op.EQUALS].map(toKey);

  return (
    <hstack gap="small">
      <vstack gap="small">
        <hstack gap="small">{topOps}</hstack>
        {numbers}
      </vstack>
      <vstack gap="small">{sideOps}</vstack>
    </hstack>
  );
};
