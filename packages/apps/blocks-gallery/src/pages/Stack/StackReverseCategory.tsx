import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const StackReverseCategory = (): JSX.Element => {
  const options: [string, boolean][] = [
    ['False *', false],
    ['True', true],
  ];

  const letters: string[] = ['A', 'B', 'C'];

  const content = options.map(([label, option]) => (
    <Tile label={label}>
      <hstack reverse={option} gap="small">
        {letters.map((letter) => (
          <hstack
            width={'32px'}
            height={'32px'}
            backgroundColor={'#0045ac'}
            alignment={'middle center'}
          >
            <text selectable={false} weight="bold" color="#ffffff">
              {letter}
            </text>
          </hstack>
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
