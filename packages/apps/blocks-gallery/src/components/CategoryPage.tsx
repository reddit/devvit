import type { UseStateResult } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import type { StatefulProps } from '../state/state.js';
import { Tabs } from './Tabs.js';

export class CategoryPageState {
  readonly _category: UseStateResult<string>;
  readonly _subcategory: UseStateResult<string>;
  readonly _goHome: () => void;

  constructor({ useState, goHome }: StatefulProps, defaultCategory: string = '') {
    this._category = useState<string>(defaultCategory);
    this._subcategory = useState<string>('');
    this._goHome = goHome;
  }

  get category(): string {
    return this._category[0];
  }

  set category(value: string) {
    this._category[1](value);
    this.subcategory = '';
  }

  setCategory = (value: string): void => {
    this.category = value;
  };

  get subcategory(): string {
    return this._subcategory[0];
  }

  set subcategory(value: string) {
    this._subcategory[1](value);
  }

  setSubCategory = (value: string): void => {
    this.subcategory = value;
  };

  goHome = (): void => this._goHome();
}

export type SharedCategoryPageProps = {
  state: CategoryPageState;
};

export type CategoryPageProps = SharedCategoryPageProps & {
  title?: string;
  categories: CategoryProps[];
  activeCategory: string;
  onCategoryChanged: (category: string) => void;
  subCategoryPage?: boolean;
};

export type CategoryProps = {
  label: string;
  category: string;
  content: JSX.Element | JSX.Element[];
};

export const CategoryPage = (props: CategoryPageProps): JSX.Element => {
  const activeCategory = props.activeCategory || props.categories[0].category;
  const matchCategory = (categoryProp: CategoryProps) => {
    return categoryProp.category === activeCategory;
   };
  const activeCategoryIndex = Math.max(props.categories.findIndex(matchCategory), 0);
  const tabCategories = props.categories.slice(Math.max(activeCategoryIndex - 1, 0), Math.min(activeCategoryIndex + 2, props.categories.length));
  const backTabOnPress = () => {
    const backCategoryIndex = Math.max(activeCategoryIndex - 1, 0)
    const backCategory = props.categories[backCategoryIndex].category;
    props.onCategoryChanged(backCategory)
  };
  const forwardTabOnPress = () => {
    const forwardCategoryIndex = Math.min(activeCategoryIndex + 1, props.categories.length - 1)
    const forwardCategory = props.categories[forwardCategoryIndex].category;
    props.onCategoryChanged(forwardCategory)
  };

  const backTabIcon = <icon
    name={'back'}
    color={activeCategoryIndex == 0 ? 'lightgray' : 'black'}
    onPress={backTabOnPress}
  />;

  const forwardTabIcon = <icon
    name={'forward'}
    color={activeCategoryIndex == props.categories.length-1 ? 'lightgray' : 'black'}
    onPress={forwardTabOnPress}
  />;

  return (
    <vstack gap="small" grow>
      {/* Header */}
      {props.subCategoryPage ? (
        <></>
      ) : (
        <hstack alignment="start middle" gap="small">
          <button onPress={props.state?.goHome} appearance="secondary" size="small" icon="back" />
          <text selectable={false} size="xlarge" weight="bold" color="neutral-content">
            {props.title}
          </text>
        </hstack>
      )}

      <Tabs
        tabs={tabCategories.map(({ label, category }) => ({
          label,
          isActive: category === activeCategory,
          onPress: () => {
            props.onCategoryChanged(category);
          },
        }))}
        backIcon={backTabIcon}
        forwardIcon={forwardTabIcon}
      />

      {
        // Page contents
        props.categories.find((page) => page.category === activeCategory)?.content ?? null
      }
    </vstack>
  );
};
