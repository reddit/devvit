import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';
import { Box } from '../../components/Box.js';
import Alignment = Devvit.Blocks.Alignment;

const horizontalAlignment: Devvit.Blocks.Alignment[] = ['start', 'center', 'end'];
const verticalAlignment: Devvit.Blocks.Alignment[] = ['top', 'middle', 'bottom'];

export const StackAlignmentPreview = ({ mode }: { mode: string }) => {
  const options = [];

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

  const content = options.map(([label, style]) => (
    <Tile label={label} padding="small">
      <zstack alignment={style as Alignment} backgroundColor="#EAEDEF">
        <Box size={2} />
        <Box size={1} color="#0045AC" rounded />
      </zstack>
    </Tile>
  ));

  return (
    <vstack grow>
      <Columns count={3}>{content}</Columns>
    </vstack>
  );
};
