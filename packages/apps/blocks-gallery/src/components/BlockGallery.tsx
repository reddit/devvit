import { Devvit } from '@devvit/public-api';
import type { SharedCategoryPageProps } from '../components/CategoryPage.js';

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

export type BlockGalleryProps = {
  state: GalleryState;
};

export const BlockGallery = ({ state }: BlockGalleryProps): JSX.Element => {
  const page = state.currentPage;
  const pageState = state.pageState(page);
  const context = state.context
  const sharedState: SharedCategoryPageProps = {state: pageState}
  return (
    <vstack padding="medium" grow>
      {page === Page.HOME && <HomePage state={state} />}
      {page === Page.BUTTONS && <ButtonPage state={pageState} />}
      {page === Page.IMAGES && <ImagePage state={pageState} />}
      {page === Page.SPACERS && <SpacerPage state={pageState} />}
      {page === Page.STACKS && <StacksPage sharedState={sharedState} context={context} />}
      {page === Page.TEXT && <TextPage state={pageState} />}
      {page === Page.ICON && <IconPage state={pageState} />}
      {page === Page.COLOR && <ColorPage state={pageState} />}
      {page === Page.SIZE && <SizePage state={pageState} />}
    </vstack>
  );
};
