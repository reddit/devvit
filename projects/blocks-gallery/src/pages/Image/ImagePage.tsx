import { Devvit } from '@devvit/public-api';

import { CategoryPage } from '../../components/CategoryPage.js';
import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { Page } from '../page.js';
import { ImageResizePreview } from './ImageResizePreview.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

type ImageMode = [string, Devvit.Blocks.ImageResizeMode];

export const ImagePage = ({ state }: SharedCategoryPageProps): JSX.Element => {
  const imageModes: ImageMode[] = [
    ['None', 'none'],
    ['Fit *', 'fit'],
    ['Fill', 'fill'],
    ['Cover', 'cover'],
    ['Scale Down', 'scale-down'],
  ];

  const categories: CategoryProps[] = imageModes.map(([label, mode]) => ({
    label,
    category: mode,
    content: <ImageResizePreview mode={mode} />,
  }));

  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={StringUtil.capitalize(Page.IMAGES)}
    />
  );
};
