import type {
  BlockQuoteContext,
  CodeBlockContext,
  HeadingContext,
  ListContext,
  ListItemContext,
  ParagraphContext,
  SpoilerContext,
  TableCellContext,
  TableContext,
  TableHeaderCellContext,
  TableRowContext,
} from './contexts.js';
import type {
  BlockQuoteOptions,
  CodeBlockOptions,
  CommentLinkOptions,
  EmbedOptions,
  HeadingOptions,
  ImageOptions,
  LinkOptions,
  ListOptions,
  PostLinkOptions,
  SubredditLinkOptions,
  TableHeaderCellOptions,
  TextOptions,
  UserLinkOptions,
  UserMentionOptions,
  VideoOptions,
} from './options.js';

/**
 * @mixin
 */
export type BlockQuoteContainer<Context> = {
  /**
   * Append a Block Quote element
   * @param opts
   * @param cb scoped callback to add child elements to this Block Quote
   */
  blockQuote(opts: BlockQuoteOptions, cb: (blockQuote: BlockQuoteContext) => void): Context;
};

/**
 * @mixin
 */
export type CodeBlockContainer<Context> = {
  /**
   * Append a Code Block element
   * @param opts {@link CodeBlockOptions}
   * @param cb scoped callback to add child elements to this Code Block
   */
  codeBlock(opts: CodeBlockOptions, cb: (codeBlock: CodeBlockContext) => void): Context;
};

/**
 * @mixin
 */
export type EmbedContainer<Context> = {
  /**
   * Append an embedded iframe
   * @param opts {@link EmbedOptions}
   */
  embed(opts: EmbedOptions): Context;
};

/**
 * @mixin
 */
export type HeadingContainer<Context> = {
  /**
   * Append a Heading
   * @param opts {@link HeadingOptions}
   * @param cb scoped callback to add child elements to this Heading
   */
  heading(opts: HeadingOptions, cb: (heading: HeadingContext) => void): Context;
};

/**
 * @mixin
 */
export type HorizontalRuleContainer<Context> = {
  /**
   * Append a Horizontal Rule
   */
  horizontalRule(): Context;
};

/**
 * @mixin
 */
export type ImageContainer<Context> = {
  /**
   * Append an Image
   * @param opts {@link ImageOptions}
   */
  image(opts: ImageOptions): Context;

  /**
   * Append an Animated Image
   * @param opts {@link ImageOptions}
   */
  animatedImage(opts: ImageOptions): Context;
};

/**
 * @mixin
 */
export type LineBreakContainer<Context> = {
  /**
   * Append a Line Break
   */
  linebreak(): Context;
};

/**
 * @mixin
 */
export type LinkContainer<Context> = RedditLinkContainer<Context> & {
  /**
   * Append a Link
   * @param opts {@link LinkOptions}
   */
  link(opts: LinkOptions): Context;
};

/**
 * @mixin
 */
export type ListContainer<Context> = {
  /**
   * Append a List
   * @param opts {@link ListOptions}
   * @param cb scoped callback to add child elements to this List
   */
  list(opts: ListOptions, cb: (list: ListContext) => void): Context;
};

/**
 * @mixin
 */
export type ListItemContainer<Context> = {
  /**
   * Append a List Item to a List
   * @param cb scoped callback to add child elements to this List Item
   */
  item(cb: (item: ListItemContext) => void): Context;
};

/**
 * @mixin
 */
export type ParagraphContainer<Context> = {
  /**
   * Append a Paragraph
   * @param cb scoped callback to add child elements to this Paragraph
   */
  paragraph(cb: (paragraph: ParagraphContext) => void): Context;
};

/**
 * @mixin
 */
export type RawTextContainer<Context> = {
  /**
   * Append unstyled text
   * @param text
   */
  rawText(text: string): Context;
};

/**
 * @mixin
 */
export type RedditLinkContainer<Context> = {
  /**
   * Append a link to a Reddit Comment
   * @param opts {@link CommentLinkOptions}
   */
  commentLink(opts: CommentLinkOptions): Context;

  /**
   * Append a link to a Reddit Post
   * @param opts {@link PostLinkOptions}
   */
  postLink(opts: PostLinkOptions): Context;

  /**
   * Append a link to a Reddit Subreddit
   * @param opts {@link SubredditLinkOptions}
   */
  subredditLink(opts: SubredditLinkOptions): Context;

  /**
   * Append a link to a Reddit User
   * @param opts {@link UserLinkOptions}
   */
  userLink(opts: UserLinkOptions): Context;

  /**
   * Append a link to a Reddit User as a @mention
   * @param opts {@link UserMentionOptions}
   */
  userMention(opts: UserMentionOptions): Context;
};

/**
 * @mixin
 */
export type SpoilerContainer<Context> = {
  /**
   * Append a Spoiler
   * @param cb scoped callback to add child elements to this Spoiler
   */
  spoiler(cb: (spoiler: SpoilerContext) => void): Context;
};

/**
 * @mixin
 */
export type TableCellContainer<Context> = {
  /**
   * Append a Cell to a Table Row
   * @param cb scoped callback to add child elements to this Table Cell
   */
  cell(cb: (cell: TableCellContext) => void): Context;
};

/**
 * @mixin
 */
export type TableContainer<Context> = {
  /**
   * Append a Table
   * @param cb scoped callback to add child elements to this Table
   */
  table(cb: (table: TableContext) => void): Context;
};

/**
 * @mixin
 */
export type TableContentContainer<Context> = {
  /**
   * Append a Table Cell to the Table Header
   * @param opts {@link TableHeaderCellOptions}
   * @param cb scoped callback to add child elements to this Table Header Cell
   */
  headerCell(opts: TableHeaderCellOptions, cb: (cell: TableHeaderCellContext) => void): Context;

  /**
   * Append a Table Row to the Table
   * @param cb scoped callback to add child elements to this Table Row
   */
  row(cb: (row: TableRowContext) => void): Context;
};

/**
 * @mixin
 */
export type TextContainer<Context> = {
  /**
   * Append Text with optional formatting
   * @param opts {@link TextOptions}
   */
  text(opts: TextOptions): Context;
};

/**
 * @mixin
 */
export type VideoContainer<Context> = {
  /**
   * Append a Video
   * @param opts {@link VideoOptions}
   */
  video(opts: VideoOptions): Context;
};
