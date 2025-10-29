// Rich-Text-JSON
//
// Rich-Text-JSON or (RTF|J) for short, is a declarative JSON format that encodes
// Reddit content. You can think of it as AST designed for rendering content.
// Historically, Reddit has encoded all of its content as Markdown. With RTF,
// clients will submit and receive content in a JSON tree instead. This
// removes the burden of parsing from clients, while providing a data-structure
// that's more suited to rendering interactive content. e.g. media galleries,
// sortable tables, etc
//
// The high level idea of the format, is that every part of the "document"
// can be represented by element nodes. Each node is a plain old JS Object.
// To differentiate each object, nodes specify their element kind. Some example
// element kinds are `par` for paragraphs, `h` for headers, `link` for links,
// `table` for tables, etc. Note: not all elements are allowable at the top-level,
//  some are used to differentiate nested data inside more complicated
// constructs, such as tables, or nested lists.
//
// Since payload size is a concern, all of the keys are shortened to be
// one character in length. There's some common conventions that will make
// it easier to grok an element's json.
//
// e - `Element`, the element type of a node. Should always be a string.
// t - `text content`, the text content of a node.
// f - `formatting`, the formatting, or text styles, applied to the node
// c - `content`, the content of the element. In most cases this will be an array
//     other objects. e.g. a paragraph's content (`c`) is a list of `Text` nodes
//     and `Link` nodes (simplified).

export type UrlString = string;

// Formatting and Text ---------------------------------------------------------

export type FormattingSpecification = number;

export enum FormattingFlag {
  bold = 1,
  italic = 2,
  underline = 4,
  strikethrough = 8,
  subscript = 16,
  superscript = 32,
  monospace = 64,
}

export type FormatRange = [
  FormattingSpecification, // the styles
  number, // start index of where the styles begin
  number, // range length, or number of characters, styles are applied to
];

export const TEXT_ELEMENT = 'text';

export type Text = {
  e: typeof TEXT_ELEMENT;
  t: string; // text
  f?: FormatRange[]; // formatting
};

export const RAW_TEXT_ELEMENT = 'raw';

export type RawText = {
  e: typeof RAW_TEXT_ELEMENT;
  t: string; // text, no formatting.
};

export const LINEBREAK_ELEMENT = 'br';

export type LineBreak = {
  e: typeof LINEBREAK_ELEMENT;
};

// Links -----------------------------------------------------------------------

export const LINK_ELEMENT = 'link';

export type Link = {
  e: typeof LINK_ELEMENT;
  t: string; // text
  u: UrlString;
  f?: FormatRange[]; // formatting
  a?: string; // alt-text / title
};

// Reddit Links ----------------------------------------------------------------

export const COMMENT_LINK_ELEMENT = 'c/';

export type CommentLink = {
  e: typeof COMMENT_LINK_ELEMENT;
  t: string; // comment permalink
};

export const POST_LINK_ELEMENT = 'p/';

export type PostLink = {
  e: typeof POST_LINK_ELEMENT;
  t: string; // post permalink
};

export const SUBREDDIT_LINK_ELEMENT = 'r/';

export type SubredditLink = {
  e: typeof SUBREDDIT_LINK_ELEMENT;
  t: string; // text === subreddit name
  l: boolean; // whether to render a leading slash
};

export const USER_LINK_ELEMENT = 'u/';

export type UserLink = {
  e: typeof USER_LINK_ELEMENT;
  t: string; // text === username
  l: boolean; // whether to render a leading slash
};

export const USER_MENTION_ELEMENT = '@';

export type UserMention = {
  e: typeof USER_MENTION_ELEMENT;
  t: string; // text === username
  l: boolean; // whether to render a leading slash
};

export type RedditLink = CommentLink | PostLink | SubredditLink | UserLink | UserMention;

// Text Nodes Spoilers ---------------------------------------------------------

export type PlainText = Text | Link | RedditLink | LineBreak;

export const SPOILER_TEXT_ELEMENT = 'spoilertext';

export type SpoilerText = {
  e: typeof SPOILER_TEXT_ELEMENT;
  c: PlainText[];
};

export type TextNode = PlainText | SpoilerText;

export const PARAGRAPH_ELEMENT = 'par';

export type ParagraphContentNode = TextNode | Image | AnimatedImage;

export type Paragraph = {
  e: typeof PARAGRAPH_ELEMENT;
  c: ParagraphContentNode[];
};

// Sections --------------------------------------------------------------------

export type HeadingText = RawText | Link | RedditLink;

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const HEADING_ELEMENT = 'h';

export type Heading = {
  e: typeof HEADING_ELEMENT;
  l: HeadingLevel;
  c?: HeadingText[];
};

export const HORIZONTAL_RULE_ELEMENT = 'hr';

export type HorizontalRule = {
  e: typeof HORIZONTAL_RULE_ELEMENT;
};

// Blocks ----------------------------------------------------------------------

export type BlockQuoteNode = BlockQuote | CodeBlock | Heading | List | Paragraph | Table;

export const BLOCK_QUOTE_ELEMENT = 'blockquote';

export type BlockQuote = {
  e: typeof BLOCK_QUOTE_ELEMENT;
  c: BlockQuoteNode[]; // c === 'content'; Note that this text should always be
  // rendered as italics, so you don't need to pass italics explicitly to this
  // node.
  a?: TextNode; // a = 'author'
};

export const CODE_BLOCK_ELEMENT = 'code';

export type CodeBlock = {
  e: typeof CODE_BLOCK_ELEMENT;
  c: RawText[];
  l?: string; // l = language. optional if clients are able to implement it
};

// Lists -----------------------------------------------------------------------

// lists are stored as flat list of list items.

export const LIST_ITEM_ELEMENT = 'li';

export type ListChild =
  | BlockQuote
  | CodeBlock
  | Heading
  | HorizontalRule
  | List
  | Paragraph
  | Table;

export type ListItem = {
  e: typeof LIST_ITEM_ELEMENT;
  c?: ListChild[]; // c = 'content' of list item
};

export const LIST_ELEMENT = 'list';

/**
 * Note: the spec is somewhat ambiguous here, consider that
 * as typed, there are multiple possible representations of
 * a list of two, top-level, paragraphs.
 *
 * e.g.
 * The CommonMark list of:
 * ```
 *  * foo
 *  * bar
 * ```
 *
 * could either be represented as
 * (List
 *    (ListChild
 *       (Paragraph 'foo')
 *       (Paragraph 'bar' )))
 *
 * OR
 *
 * (List
 *    (ListChild
 *        (Paragraph 'foo' ))
 *    (ListChild
 *        (Paragraph 'bar)))
 *
 * The spec is designed to be interoperable with our CommonMark parser, and as so,
 * the preferred encoding is the latter.
 *
 * If you would like to demo  CommonMark Markdown -> AST conversions,
 * you can try out http://spec.commonmark.org/dingus/
 */

export type List = {
  e: typeof LIST_ELEMENT;
  o: boolean; // ordered, true if this list should use numbers instead of bullets
  c: ListItem[];
};

// Table -----------------------------------------------------------------------

export type TableCellText = Text | Link | RedditLink | SpoilerText | Image | AnimatedImage;

export type TableCell = {
  c?: TableCellText[];
};

export const COLUMN_ALIGN_LEFT = 'L';
export const COLUMN_ALIGN_RIGHT = 'R';
export const COLUMN_ALIGN_CENTER = 'C';

export type ColumnAlignment =
  | typeof COLUMN_ALIGN_LEFT
  | typeof COLUMN_ALIGN_RIGHT
  | typeof COLUMN_ALIGN_CENTER;

export type TableHeaderCell = {
  a?: ColumnAlignment; // 'left' by default
  c?: TableCellText[];
};

export type TableHeaderRow = TableHeaderCell[];
export type TableRow = TableCell[];

export const TABLE_ELEMENT = 'table';

export type Table = {
  e: typeof TABLE_ELEMENT;
  h: TableHeaderRow;
  c: TableRow[]; // table body, a list of rows
};

// Embeds ----------------------------------------------------------------------

// embeds are essentially a nested iframe embed that previews a link.

export const EMBED_ELEMENT = 'embed';

export type Embed = {
  e: typeof EMBED_ELEMENT;
  u: UrlString; // the source link. if there was an <a /> around the embed ui
  // this would be the href on it.
  c: UrlString; // 'content url', or the url that's used to render the iframe
  // that shows a preview of 'u'
  x: number; // x = 'x' or width of the embed;
  y: number; // y = 'y' or the height of the embed;
};

// Media -----------------------------------------------------------------------

// all media assets have their own unique id
export type MediaAssetId = string;

// Images are represented in the document as a pointer to the media asset,
// a caption, and if it should be rendered as obfuscated.

export type ObfuscationReason = 'nsfw' | 'spoiler';

export const IMAGE_ELEMENT = 'img';

export type Image = {
  e: typeof IMAGE_ELEMENT;
  id: MediaAssetId;
  c?: string; // caption, completely optional
  o?: ObfuscationReason;
};

// Animated images, gifs, or html5 videos are similar to images, they just have
// slightly different descriptos given the different urls required to render them.
// Having a separate node type lets clients know what component should be
// used to render

export const ANIMATED_IMAGE_ELEMENT = 'gif';

export type AnimatedImage = {
  e: typeof ANIMATED_IMAGE_ELEMENT;
  id: MediaAssetId;
  c?: string; // caption, completly optional
  o?: ObfuscationReason;
};

// Videos are rendered via dynamic streaming. so instead of having different urls
// for each size we just store two urls for different streaming formats.
// Additionally, we store an array of placeholder image previews .

export const VIDEO_ELEMENT = 'video';

export type Video = {
  e: typeof VIDEO_ELEMENT;
  id: MediaAssetId;
  c?: string; // c = 'caption'
  o?: ObfuscationReason;
  p?: Image; // p = 'poster', the poster image for the video
  gifify?: boolean;
};

export type Media = Image | AnimatedImage | Video;

// Documents Overall -----------------------------------------------------------

export type DocumentNode =
  | Paragraph
  | Heading
  | HorizontalRule
  | BlockQuote
  | CodeBlock
  | Embed
  | List
  | Table
  | Media;

export type Document = DocumentNode[];

export type RichTextContent = {
  document: Document;
};
