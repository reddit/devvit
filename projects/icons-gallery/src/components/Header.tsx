import { Devvit } from '@devvit/public-api';

import { GallerySharedProps } from '../gallery.js';
import BlockComponent = Devvit.BlockComponent;

export const Header: BlockComponent<GallerySharedProps> = ({ gallery }) => {
  return (
    <>
      <hstack gap={'medium'} alignment={'middle'}>
        <hstack backgroundColor={'white'} padding={'small'} cornerRadius={'full'} grow>
          <hstack gap={'small'} alignment={'middle'} onPress={gallery.openFilterTextForm} grow>
            <icon name={'search'} color={'black'} />
            <text color={'black'} selectable={false}>
              {gallery.currentSearchLabel}
            </text>
          </hstack>
          {gallery.filterText ? (
            <icon name={'clear'} color={'black'} onPress={gallery.clearFilterText} />
          ) : (
            <></>
          )}
        </hstack>
        <icon name={'topic-art'} color={'black'} onPress={gallery.openCustomizeDialog} />
      </hstack>
    </>
  );
};
