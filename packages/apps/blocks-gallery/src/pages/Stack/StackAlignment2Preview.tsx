import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';
import Alignment = Devvit.Blocks.Alignment;

const horizontalAlignment: Devvit.Blocks.Alignment[] = ['start', 'center', 'end'];
const verticalAlignment: Devvit.Blocks.Alignment[] = ['top', 'middle', 'bottom'];

export const StackAlignment2Preview = ({ mode }: { mode: string }): JSX.Element => {
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

  const content = options.map(([label, style]) => (
    <Tile label={label} padding="small">
      <zstack height="32px" width="32px" alignment={style as Alignment} backgroundColor="#EAEDEF">
        <zstack height="64px" width="64px" backgroundColor="#0045AC" cornerRadius="full" />
      </zstack>
    </Tile>
  ));

  return (
    <vstack grow>
      <Columns count={3}>{content}</Columns>
    </vstack>
  );
};
