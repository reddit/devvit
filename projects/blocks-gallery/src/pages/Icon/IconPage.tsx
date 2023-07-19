import { Devvit } from '@devvit/public-api';

import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import { Page } from '../page.js';
import { IconsCategory } from './IconsCategory.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

export const IconPage = ({ state }: SharedCategoryPageProps) => {
  const categories: CategoryProps[] = [
    {
      label: 'Examples',
      category: 'examples',
      content: <IconsCategory state={state} />,
    },
  ];
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={StringUtil.capitalize(Page.ICON)}
    />
  );
};
