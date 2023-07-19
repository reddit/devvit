import { Devvit } from '@devvit/public-api';

import { Tile } from '../../components/Tile.js';

export const ImageResizePreview = ({ mode }: { mode: Devvit.Blocks.ImageResizeMode }) => {
  return (
    <Tile>
      <hstack backgroundColor="#EAEDEF">
        <image url="/assets/Snoo.png" resizeMode={mode} imageHeight={128} imageWidth={512} />
      </hstack>
    </Tile>
  );
};
