import { Devvit, IconName } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const ButtonIconCategory = (): JSX.Element => {
  const icons: IconName[] = ['bot', 'bot-fill', 'topic-funny', 'topic-funny-fill'];

  const content = icons.map((icon: IconName) => (
    <Tile label={icon}>
      <button appearance={'primary'} icon={icon}>
        Label
      </button>
    </Tile>
  ));

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  );
};
