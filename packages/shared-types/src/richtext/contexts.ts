import type {
  BlockQuoteContainer,
  CodeBlockContainer,
  HeadingContainer,
  HorizontalRuleContainer,
  ImageContainer,
  LineBreakContainer,
  LinkContainer,
  ListContainer,
  ListItemContainer,
  ParagraphContainer,
  RawTextContainer,
  TableCellContainer,
  TableContainer,
  TableContentContainer,
  TextContainer,
} from './containers.js';

/**
 * @borrows ParagraphContainer
 */
export interface BlockQuoteContext extends ParagraphContainer<BlockQuoteContext> {}

/**
 * @borrows RawTextContainer
 */
export interface CodeBlockContext extends RawTextContainer<CodeBlockContext> {}

/**
 * @borrows RawTextContainer
 * @borrows LinkContainer
 */
export interface HeadingContext
  extends RawTextContainer<HeadingContext>,
    LinkContainer<HeadingContext> {}

/**
 * @borrows BlockQuoteContainer
 * @borrows CodeBlockContainer
 * @borrows HeadingContainer
 * @borrows HorizontalRuleContainer
 * @borrows ListContainer
 * @borrows ParagraphContainer
 * @borrows TableContainer
 */
export interface ListItemContext
  extends BlockQuoteContainer<ListItemContext>,
    CodeBlockContainer<ListItemContext>,
    HeadingContainer<ListItemContext>,
    HorizontalRuleContainer<ListItemContext>,
    ListContainer<ListItemContext>,
    ParagraphContainer<ListItemContext>,
    TableContainer<ListItemContext> {}

/**
 * @borrows ListItemContainer
 */
export interface ListContext extends ListItemContainer<ListContext> {}

/**
 * @borrows TextContainer
 * @borrows ImageContainer
 * @borrows LinkContainer
 * @borrows LineBreakContainer
 */
export interface ParagraphContext
  extends TextContainer<ParagraphContext>,
    ImageContainer<ParagraphContext>,
    LinkContainer<ParagraphContext>,
    LineBreakContainer<ParagraphContext> {}

/**
 * @borrows TextContainer
 * @borrows LinkContainer
 * @borrows LineBreakContainer
 */
export interface SpoilerContext
  extends TextContainer<SpoilerContext>,
    LinkContainer<SpoilerContext>,
    LineBreakContainer<SpoilerContext> {}

/**
 * @borrows TextContainer
 * @borrows LinkContainer
 * @borrows ImageContainer
 */
export interface TableCellContext
  extends TextContainer<TableCellContext>,
    LinkContainer<TableCellContext>,
    ImageContainer<TableCellContext> {}

/**
 * @borrows TableContentContainer
 */
export interface TableContext extends TableContentContainer<TableContext> {}

/**
 * @borrows TableCellContext
 */
export type TableHeaderCellContext = TableCellContext;

/**
 * @borrows TableCellContainer
 */
export interface TableRowContext extends TableCellContainer<TableRowContext> {}
