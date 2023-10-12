import { Devvit } from '@devvit/public-api';

import {
  ButtonPage,
  ColorPage,
  HomePage,
  IconPage,
  ImagePage,
  Page,
  SizePage,
  SpacerPage,
  StacksPage,
  TextPage,
} from '../pages/index.js';
import type { GalleryState } from '../state/state.js';

export interface BlockGalleryProps {
  state: GalleryState;
}

export const BlockGallery = ({ state }: BlockGalleryProps): JSX.Element => {
  const page = state.currentPage;
  const pageState = state.pageState(page);
  return (
    <vstack padding="medium" grow>
      {page === Page.HOME && <HomePage state={state} />}
      {page === Page.BUTTONS && <ButtonPage state={pageState} />}
      {page === Page.IMAGES && <ImagePage state={pageState} />}
      {page === Page.SPACERS && <SpacerPage state={pageState} />}
      {page === Page.STACKS && <StacksPage state={pageState} />}
      {page === Page.TEXT && <TextPage state={pageState} />}
      {page === Page.ICON && <IconPage state={pageState} />}
      {page === Page.COLOR && <ColorPage state={pageState} />}
      {page === Page.SIZE && <SizePage state={pageState} />}
    </vstack>
  );
};
