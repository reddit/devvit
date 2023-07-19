import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import { Columns } from '../../components/Columns.js';

export const StackReverseCategory = () => {
  const options: [string, boolean][] = [
    ['False *', false],
    ['True', true],
  ];

  const letters: string[] = ['A', 'B', 'C'];

  const content = options.map(([label, option]) => (
    <Tile label={label}>
      <hstack reverse={option} gap="small">
        {letters.map((letter) => (
          <zstack backgroundColor="#0045AC">
            <hstack>
              <spacer size="large" />
            </hstack>
            <vstack>
              <spacer size="large" />
            </vstack>
            <hstack alignment="center middle">
              <text selectable={false} weight="bold" color="#ffffff">
                {letter}
              </text>
            </hstack>
          </zstack>
        ))}
      </hstack>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
