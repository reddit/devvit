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
      <zstack alignment={'center middle'}>
        <icon size={'large'} color={'transparent'} name={'admin'} />
        <vstack>
          <spacer size={'large'} />
          <spacer size={'xsmall'} />
        </vstack>
        <hstack>
          <spacer size={'large'} />
          <spacer size={'large'} />
          <spacer size={'large'} />
          <spacer size={'large'} />
          <spacer size={'large'} />
        </hstack>
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
