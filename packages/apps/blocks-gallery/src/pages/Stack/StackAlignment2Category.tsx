import { Devvit } from '@devvit/public-api';

import { StackAlignment2Preview } from './StackAlignment2Preview.js';
import { CategoryPage, CategoryPageState } from '../../components/CategoryPage.js';

export const StackAlignment2Category = ({ state }: { state: CategoryPageState }): JSX.Element => {
  const subCategories = [
    ['Horizontal', 'horizontal'],
    ['Vertical', 'vertical'],
    ['Horiz + Vert', 'horizontal vertical'],
  ];

  const content = subCategories.map(([label, subcategory]) => ({
    label,
    category: subcategory,
    content: <StackAlignment2Preview mode={subcategory} />,
  }));

  return (
    <CategoryPage
      state={state}
      subCategoryPage
      categories={content}
      activeCategory={state.subcategory}
      onCategoryChanged={state.setSubCategory}
    />
  );
};
