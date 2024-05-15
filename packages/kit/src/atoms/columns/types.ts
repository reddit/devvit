export type SizePixels = `${number}px`;

export type RenderingOrder = 'column' | 'column-fill' | 'row';

export type ColumnsProps = {
  /**
   * Number of columns to render
   */
  columnCount: number;
  /**
   * Optional limit for number of rows.
   */
  maxRows?: number;
  /**
   * Specifies how the columns are populated:
   *
   * - "column" (default): items are split evenly between all columns.
   *
   * - "column-fill": fill each column to its maximum (specified by `maxRows`) before filling the next.
   *
   * - "row": fill each row to it's maximum (specified by `columnCount`) before filling the next.
   */
  order?: RenderingOrder;
  /**
   * Optional horizontal gap between items (in pixels).
   */
  gapX?: SizePixels;
  /**
   * Optional vertical gap between items (in pixels).
   */
  gapY?: SizePixels;
};

export type SplittingFunction = <T>(input: T[], columns: number, maxRows: number) => T[][];
