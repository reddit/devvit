import { Devvit } from '@devvit/public-api';

import type { UseStateResult } from '@devvit/public-api';
import type { StatefulProps } from '../state/state.js';
import { Tabs } from './Tabs.js';

export class CategoryPageState {
  readonly _category: UseStateResult<string>;
  readonly _subcategory: UseStateResult<string>;
  readonly _goHome: () => void;

  constructor({ useState, goHome }: StatefulProps) {
    this._category = useState<string>('');
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

export interface SharedCategoryPageProps {
  state: CategoryPageState;
}

export type CategoryPageProps = SharedCategoryPageProps & {
  title?: string;
  categories: CategoryProps[];
  activeCategory: string;
  onCategoryChanged: (category: string) => void;
  subCategoryPage?: boolean;
};

export interface CategoryProps {
  label: string;
  category: string;
  content: JSX.Element | JSX.Element[];
}

export const CategoryPage = (props: CategoryPageProps): JSX.Element => {
  const activeCategory = props.activeCategory || props.categories[0].category;
  return (
    <vstack gap="small" grow>
      {/* Header */}
      {props.subCategoryPage ? (
        <></>
      ) : (
        <hstack alignment="start middle" gap="small">
          <button onPress={props.state?.goHome} appearance="secondary" size="small">
            {' ← '}
          </button>
          <text selectable={false} size="xlarge" weight="bold" color="#0F1A1C">
            {props.title}
          </text>
        </hstack>
      )}

      {/* Tabs */}
      <Tabs
        tabs={props.categories.map(({ label, category }) => ({
          label,
          isActive: category === activeCategory,
          onPress: () => {
            props.onCategoryChanged(category);
          },
        }))}
      />

      {
        // Page contents
        props.categories.find((page) => page.category === activeCategory)?.content
      }
    </vstack>
  );
};
