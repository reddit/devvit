import { Devvit } from '@devvit/public-api';

import { GallerySharedProps } from '../gallery.js';
import BlockComponent = Devvit.BlockComponent;

export const Footer: BlockComponent<GallerySharedProps> = ({ gallery }) => {
  return (
    <hstack alignment={'middle'}>
      <icon
        name={'back'}
        color={gallery.isFirstPage ? 'lightgray' : 'black'}
        onPress={gallery.isFirstPage ? undefined : gallery.prevPage}
      />
      <spacer grow />
      <text color={'black'} selectable={false}>
        {gallery.currentPageLabel}
      </text>
      <spacer grow />
      <icon
        name={'forward'}
        color={gallery.isLastPage ? 'lightgray' : 'black'}
        onPress={gallery.isLastPage ? undefined : gallery.nextPage}
      />
    </hstack>
  );
};
