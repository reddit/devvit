import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';
import Alignment = Devvit.Blocks.Alignment;

const horizontalAlignment: Devvit.Blocks.Alignment[] = ['start', 'center', 'end'];
const verticalAlignment: Devvit.Blocks.Alignment[] = ['top', 'middle', 'bottom'];

export const StackAlignmentPreview = ({ mode, stack, reverse, isChildPercent, isChildLarge }: { mode: string, stack: string, reverse: boolean, isChildPercent: boolean, isChildLarge: boolean }): JSX.Element => {
  const options: [string, string][] = [];

  if (mode.includes('vertical')) {
    for (const vert of verticalAlignment) {
      if (mode.includes('horizontal')) {
        for (const horiz of horizontalAlignment) {
          options.push([`${horiz} + ${vert}`, `${horiz} ${vert}`]);
        }
      } else {
        options.push([vert, vert]);
      }
    }
  } else if (mode.includes('horizontal')) {
    for (const horiz of horizontalAlignment) {
      options.push([horiz, horiz]);
    }
  }

  const childSize = isChildLarge ? (isChildPercent ? "300%" : "192px") : (isChildPercent ? "50%" : "32px");

  let LayoutStack = 'zstack'
  switch(stack) {
    case 'vstack':
      LayoutStack = 'vstack';
      break;
    case 'hstack':
      LayoutStack = 'hstack';
      break;
    case 'zstack':
      LayoutStack = 'zstack';
      break;
  };

  const content = options.map(([label, style]) => (
    <Tile label={label} padding="small">
      <LayoutStack height="64px" width="64px" alignment={style as Alignment} reverse={ reverse } backgroundColor="#EAEDEF">
        <zstack height={ childSize } width={ childSize } backgroundColor="#0045AC" cornerRadius="full" />
      </LayoutStack>
    </Tile>
  ));

  return (
    <vstack grow>
      <Columns count={3}>{content}</Columns>
    </vstack>
  );
};
