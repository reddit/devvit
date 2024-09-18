import { Devvit } from '@devvit/public-api';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

import type { CategoryProps, SharedCategoryPageProps } from '../../components/CategoryPage.js';
import { CategoryPage } from '../../components/CategoryPage.js';
import { Page } from '../page.js';
import { ColorPrimitivesPage } from './ColorPrimitivesPage.js';
import { ColorSemanticPage } from './ColorSemanticPage.js';
import { ColorSubcategoryPage } from './ColorSubcategoryPage.js';

const hexCategories = [
  ['#RRGGBB', 'six'],
  ['#RGB', 'three'],
  ['#RRGGBBAA', 'eight'],
  ['#RGBA', 'four'],
];

const rgbCategories = [
  ['rgb()', ''],
  ['rgba()', 'a'],
];

// TODO: Uncomment once HSL is supported in public-api (DXR-440)
// const hslCategories = [
//   ['hsl()', ''],
//   ['hsla()', 'a'],
// ];

export const ColorPage = ({ state }: SharedCategoryPageProps): JSX.Element => {
  const categories: CategoryProps[] = [
    {
      label: 'Hex',
      category: 'hex',
      content: <ColorSubcategoryPage state={state} subcategories={hexCategories} />,
    },
    {
      label: 'RGB',
      category: 'rgb',
      content: <ColorSubcategoryPage state={state} subcategories={rgbCategories} />,
    },
    // TODO: Uncomment once HSL is supported in public-api (DXR-440)
    // {
    //   label: 'HSL',
    //   category: 'hsl',
    //   content: <ColorSubcategoryPage state={state} subcategories={hslCategories} />,
    // },
    {
      label: 'Primitives',
      category: 'primitives',
      content: <ColorPrimitivesPage state={state} />,
    },
    {
      label: 'Semantic',
      category: 'semantic',
      content: <ColorSemanticPage />,
    },
  ];
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={StringUtil.capitalize(Page.COLOR)}
    />
  );
};
