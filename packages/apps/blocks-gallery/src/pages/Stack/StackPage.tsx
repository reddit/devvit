import type { ContextAPIClients } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { CategoryPage, CategoryPageType } from '../../components/CategoryPage.js';
import { Page } from '../page.js';
import { StackAlignmentCategory } from './StackAlignmentCategory.js';
import { StackBorderCategory } from './StackBorderCategory.js';
import { StackDirectionCategory } from './StackDirectionCategory.js';
import { StackGapCategory } from './StackGapCategory.js';
import { StackPaddingCategory } from './StackPaddingCategory.js';
import { StackReverseCategory } from './StackReverseCategory.js';
import { StackRoundingCategory } from './StackRoundingCategory.js';
import { StackZStackCategory } from './ZStack/StackZStackCategory.js';

export const StacksPage = ({
  sharedState,
  context,
}: {
  sharedState: SharedCategoryPageProps;
  context: ContextAPIClients;
}): JSX.Element => {
  const state = sharedState.state;
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
      content: <StackAlignmentCategory state={state} context={context} />,
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
    {
      label: 'ZStack',
      category: 'zstack',
      content: <StackZStackCategory state={state} />,
    },
  ];
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={StringUtil.capitalize(Page.STACKS)}
      type={CategoryPageType.Buttons}
    />
  );
};
