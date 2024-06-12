import type { UseStateResult } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { Columns } from '../components/Columns.js';
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

export enum CategoryPageType {
  Tabs,
  Buttons,
}

export type CategoryPageProps = SharedCategoryPageProps & {
  title?: string;
  categories: CategoryProps[];
  activeCategory: string;
  onCategoryChanged: (category: string) => void;
  subCategoryPage?: boolean;
  type?: CategoryPageType;
  onConfigureCategory?: () => void;
  categoryConfigurationDescription?: string;
};

export type CategoryProps = {
  label: string;
  category: string;
  content: JSX.Element | JSX.Element[];
};

export const CategoryPage = (props: CategoryPageProps): JSX.Element => {
  const selectedCategory = props.activeCategory;
  const activeCategory = selectedCategory || props.categories[0].category;
  const matchCategory = (categoryProp: CategoryProps): boolean => {
    return categoryProp.category === activeCategory;
  };
  const activeCategoryIndex = Math.max(props.categories.findIndex(matchCategory), 0);
  const tabCategories = props.categories.slice(
    Math.max(activeCategoryIndex - 1, 0),
    Math.min(activeCategoryIndex + 2, props.categories.length)
  );
  const backTabOnPress = (): void => {
    const backCategoryIndex = Math.max(activeCategoryIndex - 1, 0);
    const backCategory = props.categories[backCategoryIndex].category;
    props.onCategoryChanged(backCategory);
  };
  const forwardTabOnPress = (): void => {
    const forwardCategoryIndex = Math.min(activeCategoryIndex + 1, props.categories.length - 1);
    const forwardCategory = props.categories[forwardCategoryIndex].category;
    props.onCategoryChanged(forwardCategory);
  };

  const backTabIcon = (
    <icon
      name={'back'}
      color={activeCategoryIndex === 0 ? 'lightgray' : 'black'}
      onPress={backTabOnPress}
    />
  );

  const forwardTabIcon = (
    <icon
      name={'forward'}
      color={activeCategoryIndex === props.categories.length - 1 ? 'lightgray' : 'black'}
      onPress={forwardTabOnPress}
    />
  );

  const pageType = props.type || CategoryPageType.Tabs;

  const tabsPage: JSX.Element = (
    <vstack gap="small" grow>
      {/* Header */}
      {props.subCategoryPage ? (
        props.onConfigureCategory ? (
          <hstack gap={'medium'} alignment={'start middle'}>
            <button size={'small'} onPress={props.onConfigureCategory}>
              configure
            </button>
            <text style={'heading'} selectable={false} color="neutral-content-weak">
              {props.title}
            </text>
          </hstack>
        ) : (
          <></>
        )
      ) : (
        <vstack alignment="start middle" gap="small">
          <hstack alignment="start middle" gap="small">
            <button onPress={props.state?.goHome} appearance="secondary" size="small" icon="back" />
            <text selectable={false} size="xlarge" weight="bold" color="neutral-content">
              {props.title}
            </text>
            {props.onConfigureCategory ? (
              <button size={'small'} onPress={props.onConfigureCategory}>
                configure
              </button>
            ) : (
              <></>
            )}
          </hstack>
          {props.categoryConfigurationDescription ? (
            <text style={'heading'} selectable={false} color="neutral-content-weak" wrap={true}>
              {props.categoryConfigurationDescription}
            </text>
          ) : (
            <></>
          )}
        </vstack>
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

  const categoryPageButtons = props.categories.map(({ label, category }) => (
    <button
      onPress={() => {
        props.onCategoryChanged(category);
      }}
    >
      {label}
    </button>
  ));

  const buttonsPageBackImpl = (): void => {
    if (selectedCategory == null || selectedCategory.length === 0) {
      props.state?.goHome();
    } else {
      props.onCategoryChanged('');
    }
  };

  const buttonsPage: JSX.Element = (
    <vstack gap="small">
      {/* Header */}
      {props.subCategoryPage ? (
        <></>
      ) : (
        <hstack alignment="start middle" gap="small">
          <button onPress={buttonsPageBackImpl} appearance="secondary" size="small" icon="back" />
          <text selectable={false} size="xlarge" weight="bold" color="neutral-content">
            {props.title}
          </text>
        </hstack>
      )}

      {selectedCategory == null || selectedCategory.length === 0 ? (
        <Columns count={2}>{categoryPageButtons}</Columns>
      ) : (
        <text style={'heading'} selectable={false} color="neutral-content-weak">
          {selectedCategory}
        </text>
      )}

      {
        // Only show content if category selected
        props.categories.find((page) => page.category === selectedCategory)?.content ?? null
      }
    </vstack>
  );

  return pageType === CategoryPageType.Tabs ? tabsPage : buttonsPage;
};
