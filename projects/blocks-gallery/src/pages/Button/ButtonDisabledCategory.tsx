import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const ButtonDisabledCategory = () => {
  const options: [string, Devvit.Blocks.ButtonAppearance][] = [
    ['Primary', 'primary'],
    ['Secondary *', 'secondary'],
    ['Plain', 'plain'],
    ['Bordered', 'bordered'],
    ['Destructive', 'destructive'],
    ['Media', 'media'],
    ['Success', 'success'],
  ];

  const content = options.map(([label, appearance]) => (
    <Tile label={label} padding={'small'}>
      <hstack gap="small">
        <button appearance={appearance}>Enabled</button>
        <button appearance={appearance} disabled>
          Disabled
        </button>
      </hstack>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
