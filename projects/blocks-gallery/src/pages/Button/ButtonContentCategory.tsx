import { Devvit } from '@devvit/public-api';

import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

export const ButtonContentCategory = () => {
  return (
    <vstack>
      <Columns count={3}>
        <Tile label="Label">
          <button>Label</button>
        </Tile>
        <Tile label="Icon">
          <button icon="upvote-outline">Label</button>
        </Tile>
        <Tile label="Label and icon">
          <button icon="chat-outline">Chat</button>
        </Tile>
      </Columns>
    </vstack>
  );
};
