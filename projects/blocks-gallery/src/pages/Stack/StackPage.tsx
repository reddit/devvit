import { Devvit } from '@devvit/public-api';

import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import { StackDirectionCategory } from './StackDirectionCategory.js';
import { StackRoundingCategory } from './StackRoundingCategory.js';
import { StackAlignmentCategory } from './StackAlignmentCategory.js';
import { StackGapCategory } from './StackGapCategory.js';
import { StackPaddingCategory } from './StackPaddingCategory.js';
import { StackBorderCategory } from './StackBorderCategory.js';
import { StackReverseCategory } from './StackReverseCategory.js';
import { Page } from '../page.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

export const StacksPage = ({ state }: SharedCategoryPageProps): JSX.Element => {
  const categories: CategoryProps[] = [
    {
      label: 'Direction',
      category: 'direction',
      content: <StackDirectionCategory />,
    },
    {
      label: 'Gap',
      category: 'gap',
      content: <StackGapCategory />,
    },
    {
      label: 'Padding',
      category: 'padding',
      content: <StackPaddingCategory />,
    },
    {
      label: 'Alignment',
      category: 'alignment',
      content: <StackAlignmentCategory state={state} />,
    },
    {
      label: 'Corner radius',
      category: 'rounding',
      content: <StackRoundingCategory />,
    },
    {
      label: 'Border',
      category: 'border',
      content: <StackBorderCategory />,
    },
    {
      label: 'Reverse',
      category: 'reverse',
      content: <StackReverseCategory />,
    },
  ];
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={StringUtil.capitalize(Page.STACKS)}
    />
  );
};
