import { Devvit } from '@devvit/public-api';

import { StringUtil } from '@devvit/shared-types/StringUtil.js';

import type { CategoryPageState } from '../../components/CategoryPage.js';
import { Columns } from '../../components/Columns.js';
import { Tile } from '../../components/Tile.js';

import { COLOR } from './colors.js';

export const ColorPreview = ({
  state,
  defaultSubcategory,
}: {
  state: CategoryPageState;
  defaultSubcategory: string;
}): JSX.Element => {
  return (
    <Columns count={2}>
      {Object.entries(COLOR).map(([colorName, colorValues]) => {
        const subcategory = state.subcategory || defaultSubcategory;
        const suffix = subcategory && `-${subcategory}`;
        const key = `${state.category}${suffix}`;
        return (
          <Tile label={`${StringUtil.capitalize(colorName)}: ${colorValues[key]}`}>
            <zstack>
              <image
                url={'checkerboard.png'}
                imageWidth={32}
                imageHeight={32}
                resizeMode={'none'}
              />
              <hstack
                backgroundColor={colorValues[key]}
                border={'thin'}
                borderColor={'neutral-content'}
              >
                <spacer size={'large'} shape={'square'} />
              </hstack>
            </zstack>
          </Tile>
        );
      })}
    </Columns>
  );
};
