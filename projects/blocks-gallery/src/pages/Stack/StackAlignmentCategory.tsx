import { Devvit } from '@devvit/public-api';

import { StackAlignmentPreview } from './StackAlignmentPreview.js';
import { CategoryPage, CategoryPageState } from '../../components/CategoryPage.js';

export const StackAlignmentCategory = ({ state }: { state: CategoryPageState }) => {
  const subCategories = [
    ['Horizontal', 'horizontal'],
    ['Vertical', 'vertical'],
    ['Horiz + Vert', 'horizontal vertical'],
  ];

  const content = subCategories.map(([label, subcategory]) => ({
    label,
    category: subcategory,
    content: <StackAlignmentPreview mode={subcategory} />,
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
