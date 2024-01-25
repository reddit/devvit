import { Devvit } from '@devvit/public-api';

import { CategoryPage, CategoryPageState } from '../../components/CategoryPage.js';
import { ColorPrimitivePreview } from './ColorPrimitivesPreview.js';

export const ColorPrimitivesPage = ({ state }: { state: CategoryPageState }): JSX.Element => {
  const colors = ['AlienBlue', 'SakuraPink', 'KiwiGreen'];
  const categories = colors.map((name) => ({
    label: name,
    category: name,
    content: <ColorPrimitivePreview name={name} />,
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
