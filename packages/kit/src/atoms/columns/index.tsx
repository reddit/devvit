import { Devvit } from '@devvit/public-api';
import { splitItems, splitItemsColumnFill, splitItemsRow } from './utils.js';
import type { ColumnsProps, RenderingOrder, SizePixels, SplittingFunction } from './types.js';

/**
 * columnCount: number - specifies how many columns to render
 *
 * maxRows?: number - optional limit on row quantity
 *
 * order?: RenderingOrder - specifies how the columns are populated.
 *
 * gapX?: SizePixels - horizontal gap between items
 *
 * gapY?: SizePixels - vertical gap between items
 */
export const Columns = (props: Devvit.BlockComponentProps<ColumnsProps>): JSX.Element => {
  if (!props.children || !Array.isArray(props.children)) {
    return <>{props.children}</>;
  }
  const order = props.order || 'column';
  const columnCount = props.columnCount > 0 ? props.columnCount : 1;
  const maxRows = props.maxRows && props.maxRows > 0 ? props.maxRows : Infinity;
  const gapXpx = props.gapX ? Number(props.gapX.split('px')[0]) : 0;
  const gapX: SizePixels = gapXpx && gapXpx > 0 ? `${gapXpx}px` : '0px';
  const gapYpx = props.gapY ? Number(props.gapY.split('px')[0]) : 0;
  const gapY: SizePixels = gapYpx && gapYpx > 0 ? `${gapYpx}px` : '0px';
  const splittingFunction = getSplittingFunction(order);
  const columns = splittingFunction(props.children, columnCount, maxRows);

  return (
    <hstack width={100}>
      {columns.map((column, columnIndex) => {
        return (
          <>
            {columnIndex > 0 && <hstack width={gapX}></hstack>}
            <vstack width={100 / columnCount} grow>
              {column.map((item, rowIndex) => {
                return (
                  <>
                    {rowIndex > 0 && <hstack height={gapY}></hstack>}
                    {item}
                  </>
                );
              })}
            </vstack>
          </>
        );
      })}
    </hstack>
  );
};

function getSplittingFunction(order: RenderingOrder): SplittingFunction {
  if (order === 'column') {
    return splitItems;
  }
  if (order === 'column-fill') {
    return splitItemsColumnFill;
  }
  if (order === 'row') {
    return splitItemsRow;
  }
  // render one column as a default behaviour
  return (items) => [[...items]];
}
