import { Devvit } from '@devvit/public-api';
import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import BlockComponent = Devvit.BlockComponent;
import { SizeConstraintsCategory } from './SizeConstraintsCategory.js';
import { SizeAbsoluteCategory } from './SizeAbsoluteCategory.js';
import { SizeRelativeCategory } from './SizeRelativeCategory.js';

const categories: CategoryProps[] = [
  {
    label: 'Relative',
    category: 'relative',
    content: <SizeRelativeCategory />,
  },
  {
    label: 'Absolute',
    category: 'absolute',
    content: <SizeAbsoluteCategory />,
  },
  {
    label: 'Constraints',
    category: 'constraints',
    content: <SizeConstraintsCategory />,
  },
];

export const SizePage: BlockComponent<SharedCategoryPageProps> = ({ state }) => (
  <CategoryPage
    title={'Size'}
    state={state}
    categories={categories}
    activeCategory={state.category}
    onCategoryChanged={state.setCategory}
  />
);
