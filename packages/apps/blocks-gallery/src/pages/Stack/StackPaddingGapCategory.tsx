import { Devvit } from '@devvit/public-api';
import { CategoryPage, CategoryPageState, CategoryPageType } from '../../components/CategoryPage.js';
import { StackPaddingGapPreview } from './StackPaddingGapPreview.js';

export enum StackPaddingGapConfiguration {
  None = 0,
  Gap = 1,
  Reverse = 2,
  Constrain = 4,
  Grow = 8
}

export const StackPaddingGapCategory = ({ state, configuration }: { state: CategoryPageState, configuration: number }): JSX.Element => {
  const subCategories = [
    ['HStack', 'h'],
    ['VStack', 'v'],
    ['ZStack', 'z'],
  ];

  const content = subCategories.map(([label, subcategory]) => ({
    label,
    category: subcategory,
    content: <StackPaddingGapPreview mode={subcategory} configuration={configuration}/>,
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

