import { Devvit } from '@devvit/public-api';

import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import { SpacerSizeCategory } from './SpacerSizeCategory.js';
import { Page } from '../page.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

export const SpacerPage = ({ state }: SharedCategoryPageProps) => {
  const categories: CategoryProps[] = [
    {
      label: 'Size',
      category: 'size',
      content: <SpacerSizeCategory />,
    },
  ];
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={StringUtil.capitalize(Page.SPACERS)}
    />
  );
};
