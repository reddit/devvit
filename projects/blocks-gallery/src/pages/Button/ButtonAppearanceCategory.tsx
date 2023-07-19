import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';
import { Columns } from '../../components/Columns.js';

export const ButtonAppearanceCategory = () => {
  const options: [string, Devvit.Blocks.ButtonAppearance][] = [
    ['Primary', 'primary'],
    ['Secondary *', 'secondary'],
    ['Plain', 'plain'],
    ['Bordered', 'bordered'],
    ['Destructive', 'destructive'],
    ['Media', 'media'],
    ['Success', 'success'],
  ];

  const content = options.map(([label, appearance]) => {
    return (
      <Tile label={label} padding={'small'}>
        <button appearance={appearance}>Label</button>
      </Tile>
    );
  });

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
