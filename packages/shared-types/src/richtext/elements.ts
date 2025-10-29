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
import {
  mixinBlockQuoteContext,
  mixinCodeBlockContext,
  mixinHeadingContext,
  mixinHorizontalRuleContext,
  mixinImageContext,
  mixinLineBreakContext,
  mixinLinkContext,
  mixinListContext,
  mixinListItemContext,
  mixinParagraphContext,
  mixinRawTextContext,
  mixinSpoilerContext,
  mixinTableContentContext,
  mixinTableContext,
  mixinTableRowContext,
  mixinTextContext,
} from './mixins.js';
import type {
  BlockQuoteOptions,
  CodeBlockOptions,
  CommentLinkOptions,
  EmbedOptions,
  FormatOptions,
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
import type {
  AnimatedImage,
  BlockQuote,
  BlockQuoteNode,
  CodeBlock,
  ColumnAlignment,
  CommentLink,
  Embed,
  FormatRange,
  FormattingSpecification,
  Heading,
  HeadingText,
  HorizontalRule,
  Image,
  LineBreak,
  Link,
  List,
  ListChild,
  ListItem,
  Paragraph,
  ParagraphContentNode,
  PlainText,
  PostLink,
  RawText,
  SpoilerText,
  SubredditLink,
  Table,
  TableCell,
  TableCellText,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  Text,
  UserLink,
  UserMention,
  Video,
} from './types.js';
import {
  ANIMATED_IMAGE_ELEMENT,
  BLOCK_QUOTE_ELEMENT,
  CODE_BLOCK_ELEMENT,
  COLUMN_ALIGN_CENTER,
  COLUMN_ALIGN_LEFT,
  COLUMN_ALIGN_RIGHT,
  COMMENT_LINK_ELEMENT,
  EMBED_ELEMENT,
  FormattingFlag,
  HEADING_ELEMENT,
  HORIZONTAL_RULE_ELEMENT,
  IMAGE_ELEMENT,
  LINEBREAK_ELEMENT,
  LINK_ELEMENT,
  LIST_ELEMENT,
  LIST_ITEM_ELEMENT,
  PARAGRAPH_ELEMENT,
  POST_LINK_ELEMENT,
  RAW_TEXT_ELEMENT,
  SPOILER_TEXT_ELEMENT,
  SUBREDDIT_LINK_ELEMENT,
  TABLE_ELEMENT,
  TEXT_ELEMENT,
  USER_LINK_ELEMENT,
  USER_MENTION_ELEMENT,
  VIDEO_ELEMENT,
} from './types.js';

/**
 *
 * @param opts {@link ImageOptions}
 * @returns AnimatedImage
 */
export function makeAnimatedImage(opts: ImageOptions): AnimatedImage {
  return {
    e: ANIMATED_IMAGE_ELEMENT,
    id: opts.mediaId,
    ...(opts.caption && { c: opts.caption }),
    ...(opts.blur && { o: opts.blur }),
  };
}

export function makeBlockQuote(
  opts: BlockQuoteOptions,
  cb: (blockQuote: BlockQuoteContext) => void
): BlockQuote {
  const context = {};
  const content: BlockQuoteNode[] = [];
  Object.assign(
    context,
    mixinBlockQuoteContext(context, content),
    mixinCodeBlockContext(context, content),
    mixinHeadingContext(context, content),
    mixinListContext(context, content),
    mixinParagraphContext(context, content),
    mixinTableContext(context, content)
  );
  cb(context as BlockQuoteContext);

  return {
    e: BLOCK_QUOTE_ELEMENT,
    c: content,
    ...(opts.author && { a: opts.author }),
  };
}

export function makeCodeBlock(
  opts: CodeBlockOptions,
  cb: (codeBlock: CodeBlockContext) => void
): CodeBlock {
  const context = {};
  const content: RawText[] = [];
  Object.assign(context, mixinRawTextContext(context, content));
  cb(context as CodeBlockContext);
  return {
    e: CODE_BLOCK_ELEMENT,
    c: content,
    ...(opts.language && { l: opts.language }),
  };
}

export function makeCommentLink(opts: CommentLinkOptions): CommentLink {
  return {
    e: COMMENT_LINK_ELEMENT,
    t: opts.permalink,
  };
}

export function makeHeadingContext(
  opts: HeadingOptions,
  cb: (heading: HeadingContext) => void
): Heading {
  const context = {};
  const content: HeadingText[] = [];
  Object.assign(context, mixinRawTextContext(context, content), mixinLinkContext(context, content));
  cb(context as HeadingContext);
  return {
    e: HEADING_ELEMENT,
    l: opts.level,
    c: content,
  };
}

export function makeEmbed(opts: EmbedOptions): Embed {
  return {
    e: EMBED_ELEMENT,
    u: opts.sourceUrl,
    c: opts.contentUrl,
    x: opts.width,
    y: opts.height,
  };
}

export function makeFormatting(opts: FormatOptions): FormatRange {
  let spec: FormattingSpecification = 0;
  if (opts.bold) {
    spec |= FormattingFlag.bold;
  }
  if (opts.italic) {
    spec |= FormattingFlag.italic;
  }
  if (opts.underline) {
    spec |= FormattingFlag.underline;
  }
  if (opts.strikethrough) {
    spec |= FormattingFlag.strikethrough;
  }
  if (opts.subscript) {
    spec |= FormattingFlag.subscript;
  }
  if (opts.superscript) {
    spec |= FormattingFlag.superscript;
  }
  if (opts.monospace) {
    spec |= FormattingFlag.monospace;
  }
  return [spec, opts.startIndex, opts.length];
}

export function makeHorizontalRule(): HorizontalRule {
  return { e: HORIZONTAL_RULE_ELEMENT };
}

export function makeImage(opts: ImageOptions): Image {
  return {
    e: IMAGE_ELEMENT,
    id: opts.mediaId,
    ...(opts.caption && { c: opts.caption }),
    ...(opts.blur && { o: opts.blur }),
  };
}

export function makeLineBreak(): LineBreak {
  return {
    e: LINEBREAK_ELEMENT,
  };
}

export function makeLink(opts: LinkOptions): Link {
  return {
    e: LINK_ELEMENT,
    t: opts.text,
    u: opts.url,
    ...(opts.formatting && { f: opts.formatting }),
    ...(opts.tooltip && { a: opts.tooltip }),
  };
}

export function makeList(opts: ListOptions, cb: (list: ListContext) => void): List {
  const context = {};
  const content: ListItem[] = [];
  Object.assign(context, mixinListItemContext(context, content));
  cb(context as ListContext);
  return {
    e: LIST_ELEMENT,
    o: opts.ordered,
    c: content,
  };
}

export function makeListItem(cb: (item: ListItemContext) => void): ListItem {
  const context = {};
  const content: ListChild[] = [];
  Object.assign(
    context,
    mixinBlockQuoteContext(context, content),
    mixinCodeBlockContext(context, content),
    mixinHeadingContext(context, content),
    mixinHorizontalRuleContext(context, content),
    mixinListContext(context, content),
    mixinParagraphContext(context, content),
    mixinTableContext(context, content)
  );
  cb(context as ListItemContext);
  return {
    e: LIST_ITEM_ELEMENT,
    c: content,
  };
}

export function makeParagraph(cb: (paragraph: ParagraphContext) => void): Paragraph {
  const context = {};
  const content: ParagraphContentNode[] = [];
  Object.assign(
    context,
    mixinTextContext(context, content),
    mixinLinkContext(context, content),
    mixinLineBreakContext(context, content),
    mixinSpoilerContext(context, content),
    mixinImageContext(context, content)
  );
  cb(context as ParagraphContext);
  return {
    e: PARAGRAPH_ELEMENT,
    c: content,
  };
}

export function makePostLink(opts: PostLinkOptions): PostLink {
  return {
    e: POST_LINK_ELEMENT,
    t: opts.permalink,
  };
}

export function makeRawText(text: string): RawText {
  return {
    e: RAW_TEXT_ELEMENT,
    t: text,
  };
}

export function makeSpoilerText(cb: (spoiler: SpoilerContext) => void): SpoilerText {
  const context = {};
  const content: PlainText[] = [];
  Object.assign(
    context,
    mixinTextContext(context, content),
    mixinLinkContext(context, content),
    mixinLineBreakContext(context, content)
  );
  cb(context as SpoilerContext);
  return {
    e: SPOILER_TEXT_ELEMENT,
    c: content,
  };
}

export function makeSubredditLink(opts: SubredditLinkOptions): SubredditLink {
  return {
    e: SUBREDDIT_LINK_ELEMENT,
    t: opts.subredditName,
    l: opts.showPrefix,
  };
}

export function makeTable(cb: (table: TableContext) => void): Table {
  const context = {};
  const headerContent: TableHeaderRow = [];
  const rowContent: TableRow[] = [];
  Object.assign(context, mixinTableContentContext(context, headerContent, rowContent));
  cb(context as TableContext);
  return {
    e: TABLE_ELEMENT,
    h: headerContent,
    c: rowContent,
  };
}

export function makeTableCell(cb: (cell: TableCellContext) => void): TableCell {
  const [context, content] = tableCellTextContext();
  cb(context as TableCellContext);
  return {
    c: content,
  };
}

export function makeTableHeaderCell(
  opts: TableHeaderCellOptions,
  cb: (cell: TableHeaderCellContext) => void
): TableHeaderCell {
  const [context, content] = tableCellTextContext();
  cb(context as TableHeaderCellContext);
  let alignment: ColumnAlignment | undefined;
  switch (opts.columnAlignment) {
    case 'left':
      alignment = COLUMN_ALIGN_LEFT;
      break;
    case 'right':
      alignment = COLUMN_ALIGN_RIGHT;
      break;
    case 'center':
      alignment = COLUMN_ALIGN_CENTER;
      break;
  }
  return {
    ...(alignment && { a: alignment }),
    ...(content && { c: content }),
  };
}

export function makeTableRow(cb: (row: TableRowContext) => void): TableRow {
  const context = {};
  const content: TableRow = [];
  Object.assign(context, mixinTableRowContext(context, content));
  cb(context as TableRowContext);
  return content;
}

export function makeText(opts: TextOptions): Text {
  return {
    e: TEXT_ELEMENT,
    t: opts.text,
    ...(opts.formatting && { f: opts.formatting }),
  };
}

export function makeUserLink(opts: UserLinkOptions): UserLink {
  return {
    e: USER_LINK_ELEMENT,
    t: opts.username,
    l: opts.showPrefix,
  };
}

export function makeUserMention(opts: UserMentionOptions): UserMention {
  return {
    e: USER_MENTION_ELEMENT,
    t: opts.username,
    l: opts.showPrefix,
  };
}

export function makeVideo(opts: VideoOptions): Video {
  return {
    e: VIDEO_ELEMENT,
    id: opts.mediaId,
    ...(opts.caption && { c: opts.caption }),
    ...(opts.blur && { o: opts.blur }),
    ...(opts.thumbnail && { p: opts.thumbnail }),
    ...(opts.convertToGif && { gifify: opts.convertToGif }),
  };
}

function tableCellTextContext(): [{}, TableCellText[]] {
  const context = {};
  const content: TableCellText[] = [];
  Object.assign(
    context,
    mixinTextContext(context, content),
    mixinLinkContext(context, content),
    mixinSpoilerContext(context, content),
    mixinImageContext(context, content)
  );
  return [context, content];
}
