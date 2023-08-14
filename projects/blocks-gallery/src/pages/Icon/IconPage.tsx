import { Devvit } from '@devvit/public-api';

import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import { Page } from '../page.js';
import { IconsCategory } from './IconsCategory.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { IconSizeCategory } from "./IconSizeCategory.js";

export const IconPage = ({ state }: SharedCategoryPageProps): JSX.Element => {
  const categories: CategoryProps[] = [
    {
      label: 'Examples',
      category: 'examples',
      content: <IconsCategory state={state} />,
    },
    {
      label: 'Size',
      category: 'size',
      content: <IconSizeCategory />,
    }
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
