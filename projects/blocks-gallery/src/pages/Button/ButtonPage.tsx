import { Devvit } from '@devvit/public-api';

import { ButtonAppearanceCategory } from './ButtonAppearanceCategory.js';
import { ButtonSizeCategory } from './ButtonSizeCategory.js';
import { ButtonContentCategory } from './ButtonContentCategory.js';
import { ButtonGrowCategory } from './ButtonGrowCategory.js';
import { ButtonDisabledCategory } from './ButtonDisabledCategory.js';
import type { SharedCategoryPageProps, CategoryProps } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import { Page } from '../page.js';
import { ButtonIconCategory } from './ButtonIconCategory.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

export const ButtonPage = ({ state }: SharedCategoryPageProps): JSX.Element => {
  const categories: CategoryProps[] = [
    {
      label: 'Appearances',
      category: 'appearance',
      content: <ButtonAppearanceCategory />,
    },
    {
      label: 'Sizes',
      category: 'size',
      content: <ButtonSizeCategory />,
    },
    {
      label: 'Contents',
      category: 'content',
      content: <ButtonContentCategory />,
    },
    {
      label: 'Grow',
      category: 'grow',
      content: <ButtonGrowCategory />,
    },
    {
      label: 'Disabled',
      category: 'disabled',
      content: <ButtonDisabledCategory />,
    },
    {
      label: 'Icons',
      category: 'icons',
      content: <ButtonIconCategory />,
    },
  ];

  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={StringUtil.capitalize(Page.BUTTONS)}
    />
  );
};
