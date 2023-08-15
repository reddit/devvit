import { Devvit } from '@devvit/public-api';

import { CategoryPage, CategoryPageState } from '../../components/CategoryPage.js';
import { ColorPreview } from './ColorPreview.js';

export const ColorSubcategoryPage = ({
  state,
  subcategories,
}: {
  state: CategoryPageState;
  subcategories: string[][];
}): JSX.Element => {
  const content = <ColorPreview state={state} defaultSubcategory={subcategories[0][1]} />;
  const categories = subcategories.map(([label, category]) => ({
    label,
    category,
    content,
  }));

  return (
    <CategoryPage
      state={state}
      subCategoryPage
      categories={categories}
      activeCategory={state.subcategory}
      onCategoryChanged={state.setSubCategory}
    />
  );
};
