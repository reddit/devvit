import { Devvit, IconName } from '@devvit/public-api';
import BlockComponent = Devvit.BlockComponent;
import { GallerySharedProps } from '../gallery.js';

type IconTileProps = GallerySharedProps & {
  icon: string;
};

export const IconTile: BlockComponent<IconTileProps> = ({ gallery, icon }) => {
  return (
    <vstack
      padding={'small'}
      backgroundColor={'white'}
      cornerRadius={'medium'}
      alignment={'center'}
      gap={'none'}
    >
      <zstack alignment={'center middle'} width={'140px'} height={'35px'}>
        <hstack gap={'medium'}>
          <icon
            name={`${icon}-outline` as IconName}
            color={gallery.currentColor || 'black'}
            size={gallery.currentSize}
          />
          <icon
            name={`${icon}-fill` as IconName}
            color={gallery.currentColor || 'black'}
            size={gallery.currentSize}
          />
        </hstack>
      </zstack>
      <text color={'black'} alignment={'center'}>
        {icon}
      </text>
    </vstack>
  );
};
