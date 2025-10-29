import type {
  BlockQuoteContainer,
  CodeBlockContainer,
  EmbedContainer,
  HeadingContainer,
  HorizontalRuleContainer,
  ImageContainer,
  LineBreakContainer,
  LinkContainer,
  ListContainer,
  ListItemContainer,
  ParagraphContainer,
  RawTextContainer,
  SpoilerContainer,
  TableCellContainer,
  TableContainer,
  TableContentContainer,
  TextContainer,
  VideoContainer,
} from './containers.js';
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
  makeAnimatedImage,
  makeBlockQuote,
  makeCodeBlock,
  makeCommentLink,
  makeEmbed,
  makeHeadingContext,
  makeHorizontalRule,
  makeImage,
  makeLineBreak,
  makeLink,
  makeList,
  makeListItem,
  makeParagraph,
  makePostLink,
  makeRawText,
  makeSpoilerText,
  makeSubredditLink,
  makeTable,
  makeTableCell,
  makeTableHeaderCell,
  makeTableRow,
  makeText,
  makeUserLink,
  makeUserMention,
  makeVideo,
} from './elements.js';
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
import type {
  AnimatedImage,
  BlockQuote,
  CodeBlock,
  Embed,
  Heading,
  HorizontalRule,
  Image,
  LineBreak,
  Link,
  List,
  ListItem,
  Paragraph,
  RawText,
  RedditLink,
  SpoilerText,
  Table,
  TableHeaderRow,
  TableRow,
  Text,
  Video,
} from './types.js';

export function mixinBlockQuoteContext<T>(
  ctx: T,
  c: unknown[] | BlockQuote[]
): BlockQuoteContainer<T> {
  return {
    blockQuote(opts: BlockQuoteOptions, cb: (blockQuote: BlockQuoteContext) => void): T {
      c.push(makeBlockQuote(opts, cb));
      return ctx;
    },
  };
}

export function mixinCodeBlockContext<T>(
  ctx: T,
  c: unknown[] | CodeBlock[]
): CodeBlockContainer<T> {
  return {
    codeBlock(opts: CodeBlockOptions, cb: (codeBlock: CodeBlockContext) => void): T {
      c.push(makeCodeBlock(opts, cb));
      return ctx;
    },
  };
}

export function mixinEmbedContext<T>(ctx: T, c: unknown[] | Embed[]): EmbedContainer<T> {
  return {
    embed(opts: EmbedOptions): T {
      c.push(makeEmbed(opts));
      return ctx;
    },
  };
}

export function mixinHeadingContext<T>(ctx: T, c: unknown[] | Heading[]): HeadingContainer<T> {
  return {
    heading(opts: HeadingOptions, cb: (heading: HeadingContext) => void): T {
      c.push(makeHeadingContext(opts, cb));
      return ctx;
    },
  };
}

export function mixinHorizontalRuleContext<T>(
  ctx: T,
  c: unknown[] | HorizontalRule[]
): HorizontalRuleContainer<T> {
  return {
    horizontalRule(): T {
      c.push(makeHorizontalRule());
      return ctx;
    },
  };
}

export function mixinImageContext<T>(
  ctx: T,
  c: unknown[] | Image[] | AnimatedImage[]
): ImageContainer<T> {
  return {
    image(opts: ImageOptions): T {
      (c as Image[]).push(makeImage(opts));
      return ctx;
    },
    animatedImage(opts: ImageOptions): T {
      (c as AnimatedImage[]).push(makeAnimatedImage(opts));
      return ctx;
    },
  };
}

export function mixinLineBreakContext<T>(
  ctx: T,
  c: unknown[] | LineBreak[]
): LineBreakContainer<T> {
  return {
    linebreak(): T {
      c.push(makeLineBreak());
      return ctx;
    },
  };
}

export function mixinLinkContext<T>(
  ctx: T,
  c: unknown[] | Link[] | RedditLink[]
): LinkContainer<T> {
  return {
    link(opts: LinkOptions): T {
      (c as Link[]).push(makeLink(opts));
      return ctx;
    },
    commentLink(opts: CommentLinkOptions): T {
      (c as RedditLink[]).push(makeCommentLink(opts));
      return ctx;
    },
    postLink(opts: PostLinkOptions): T {
      (c as RedditLink[]).push(makePostLink(opts));
      return ctx;
    },
    subredditLink(opts: SubredditLinkOptions): T {
      (c as RedditLink[]).push(makeSubredditLink(opts));
      return ctx;
    },
    userLink(opts: UserLinkOptions): T {
      (c as RedditLink[]).push(makeUserLink(opts));
      return ctx;
    },
    userMention(opts: UserMentionOptions): T {
      (c as RedditLink[]).push(makeUserMention(opts));
      return ctx;
    },
  };
}

export function mixinListContext<T>(ctx: T, c: unknown[] | List[]): ListContainer<T> {
  return {
    list(opts: ListOptions, cb: (list: ListContext) => void): T {
      c.push(makeList(opts, cb));
      return ctx;
    },
  };
}

export function mixinListItemContext<T>(ctx: T, c: unknown[] | ListItem[]): ListItemContainer<T> {
  return {
    item(cb: (item: ListItemContext) => void): T {
      c.push(makeListItem(cb));
      return ctx;
    },
  };
}

export function mixinParagraphContext<T>(
  ctx: T,
  c: unknown[] | Paragraph[]
): ParagraphContainer<T> {
  return {
    paragraph(cb: (paragraph: ParagraphContext) => void): T {
      c.push(makeParagraph(cb));
      return ctx;
    },
  };
}

export function mixinRawTextContext<T>(ctx: T, c: unknown[] | RawText[]): RawTextContainer<T> {
  return {
    rawText(text: string): T {
      c.push(makeRawText(text));
      return ctx;
    },
  };
}

export function mixinSpoilerContext<T>(ctx: T, c: unknown[] | SpoilerText[]): SpoilerContainer<T> {
  return {
    spoiler(cb: (spoiler: SpoilerContext) => void): T {
      c.push(makeSpoilerText(cb));
      return ctx;
    },
  };
}

export function mixinTableContentContext<T>(
  ctx: T,
  h: unknown[] | TableHeaderRow,
  c: unknown[] | TableRow[]
): TableContentContainer<T> {
  return {
    headerCell(opts: TableHeaderCellOptions, cb: (cell: TableHeaderCellContext) => void): T {
      h.push(makeTableHeaderCell(opts, cb));
      return ctx;
    },
    row(cb: (row: TableRowContext) => void): T {
      c.push(makeTableRow(cb));
      return ctx;
    },
  };
}

export function mixinTableContext<T>(ctx: T, c: unknown[] | Table[]): TableContainer<T> {
  return {
    table(cb: (table: TableContext) => void): T {
      c.push(makeTable(cb));
      return ctx;
    },
  };
}

export function mixinTableRowContext<T>(ctx: T, c: TableRow): TableCellContainer<T> {
  return {
    cell(cb: (cell: TableCellContext) => void): T {
      c.push(makeTableCell(cb));
      return ctx;
    },
  };
}

export function mixinTextContext<T>(ctx: T, c: unknown[] | Text[]): TextContainer<T> {
  return {
    text(opts: TextOptions): T {
      c.push(makeText(opts));
      return ctx;
    },
  };
}

export function mixinVideoContext<T>(ctx: T, c: unknown[] | Video[]): VideoContainer<T> {
  return {
    video(opts: VideoOptions): T {
      c.push(makeVideo(opts));
      return ctx;
    },
  };
}
