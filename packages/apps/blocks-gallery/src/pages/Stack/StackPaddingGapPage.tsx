import { Devvit } from '@devvit/public-api';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { CategoryPage, CategoryPageType } from '../../components/CategoryPage.js';
import { Page } from '../page.js';
import {
  StackPaddingGapCategory,
  StackPaddingGapConfiguration,
} from './StackPaddingGapCategory.js';

export const StackPaddingGapPage = ({ state }: SharedCategoryPageProps): JSX.Element => {
  const categories: CategoryProps[] = [
    {
      label: 'None',
      category: 'padding-none',
      content: (
        <StackPaddingGapCategory state={state} configuration={StackPaddingGapConfiguration.None} />
      ),
    },
    {
      label: 'Gap',
      category: 'padding-gap',
      content: (
        <StackPaddingGapCategory state={state} configuration={StackPaddingGapConfiguration.Gap} />
      ),
    },
    {
      label: 'Reverse',
      category: 'padding-reverse',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={StackPaddingGapConfiguration.Reverse}
        />
      ),
    },
    {
      label: 'Constrain',
      category: 'padding-constrain',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={StackPaddingGapConfiguration.Constrain}
        />
      ),
    },
    {
      label: 'Grow',
      category: 'padding-grow',
      content: (
        <StackPaddingGapCategory state={state} configuration={StackPaddingGapConfiguration.Grow} />
      ),
    },
    {
      label: 'Gap, Rev',
      category: 'padding-gap-reverse',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={StackPaddingGapConfiguration.Gap | StackPaddingGapConfiguration.Reverse}
        />
      ),
    },
    {
      label: 'Gap, Const.',
      category: 'padding-gap-constrain',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={StackPaddingGapConfiguration.Gap | StackPaddingGapConfiguration.Constrain}
        />
      ),
    },
    {
      label: 'Gap, Grow',
      category: 'padding-gap-grow',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={StackPaddingGapConfiguration.Gap | StackPaddingGapConfiguration.Grow}
        />
      ),
    },
    {
      label: 'Rev, Const',
      category: 'padding-reverse-constrain',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={
            StackPaddingGapConfiguration.Reverse | StackPaddingGapConfiguration.Constrain
          }
        />
      ),
    },
    {
      label: 'Rev, Grow',
      category: 'padding-reverse-grow',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={StackPaddingGapConfiguration.Reverse | StackPaddingGapConfiguration.Grow}
        />
      ),
    },
    {
      label: 'Const, Grow',
      category: 'padding-constrain-grow',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={StackPaddingGapConfiguration.Constrain | StackPaddingGapConfiguration.Grow}
        />
      ),
    },
    {
      label: 'Gap, Rev, Const',
      category: 'padding-gap-reverse-constrain',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={
            StackPaddingGapConfiguration.Gap |
            StackPaddingGapConfiguration.Reverse |
            StackPaddingGapConfiguration.Constrain
          }
        />
      ),
    },
    {
      label: 'Gap, Rev, Grow',
      category: 'padding-gap-reverse-grow',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={
            StackPaddingGapConfiguration.Gap |
            StackPaddingGapConfiguration.Reverse |
            StackPaddingGapConfiguration.Grow
          }
        />
      ),
    },
    {
      label: 'Gap, Const, Grow',
      category: 'padding-gap-constrain-grow',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={
            StackPaddingGapConfiguration.Gap |
            StackPaddingGapConfiguration.Constrain |
            StackPaddingGapConfiguration.Grow
          }
        />
      ),
    },
    {
      label: 'Rev, Const, Grow',
      category: 'padding-reverse-constrain-grow',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={
            StackPaddingGapConfiguration.Reverse |
            StackPaddingGapConfiguration.Constrain |
            StackPaddingGapConfiguration.Grow
          }
        />
      ),
    },
    {
      label: 'All',
      category: 'padding-gap-reverse-constrain-grow',
      content: (
        <StackPaddingGapCategory
          state={state}
          configuration={
            StackPaddingGapConfiguration.Gap |
            StackPaddingGapConfiguration.Reverse |
            StackPaddingGapConfiguration.Constrain |
            StackPaddingGapConfiguration.Grow
          }
        />
      ),
    },
  ];
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={StringUtil.capitalize(Page.STACKPADDINGGAP)}
      type={CategoryPageType.Buttons}
    />
  );
};
