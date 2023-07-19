import { Devvit } from '@devvit/public-api';

import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import { TextSizeCategory } from './TextSizeCategory.js';
import { TextWeightCategory } from './TextWeightCategory.js';
import { TextOutlineCategory } from './TextOutlineCategory.js';
import { TextStyleCategory } from './TextStyleCategory.js';
import { Page } from '../page.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

export const TextPage = ({ state }: SharedCategoryPageProps) => {
  const categories: CategoryProps[] = [
    {
      label: 'Sizes',
      category: 'size',
      content: <TextSizeCategory />,
    },
    {
      label: 'Weights',
      category: 'weight',
      content: <TextWeightCategory />,
    },
    {
      label: 'Outline',
      category: 'outline',
      content: <TextOutlineCategory />,
    },
    {
      label: 'Styles',
      category: 'style',
      content: <TextStyleCategory />,
    },
  ];
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={StringUtil.capitalize(Page.TEXT)}
    />
  );
};
