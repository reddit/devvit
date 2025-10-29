import type { FormatRange, HeadingLevel, Image, ObfuscationReason, TextNode } from './types.js';

export type BlockQuoteOptions = {
  /**
   * Element for author attribution
   * @see {@link TextNode}
   * @example { author: makeUserLink({ username: 'spez', showPrefix: true }) }
   */
  author?: TextNode;
};

export type CodeBlockOptions = {
  /**
   * Language of the content in this Code Block
   * @example { language: 'javascript' }
   */
  language?: string;
};

/**
 * @borrows RedditPermalinkOptions
 */
export type CommentLinkOptions = RedditPermalinkOptions;

export type EmbedOptions = {
  /** Destination URL when the embed is clicked */
  sourceUrl: string;
  /** URL to load in the embedded iframe */
  contentUrl: string;
  width: number;
  height: number;
};

export type FormatOptions = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  monospace?: boolean;
  /** Starting index to receive this formatting */
  startIndex: number;
  /** Number of characters from the startIndex to receive this formatting */
  length: number;
};

export type HeadingOptions = {
  /**
   * The depth for this heading (such as <h1>, <h2>, <h3>)
   * @see {@link HeadingLevel}
   */
  level: HeadingLevel;
};

/**
 * @borrows MediaOptions
 */
export type ImageOptions = MediaOptions;

/**
 * @borrows TextOptions
 */
export type LinkOptions = TextOptions & {
  /** Destination URL */
  url: string;
  /** Tooltip text shown when the link is focused */
  tooltip?: string;
};

export type ListOptions = {
  /** Whether to use numbers or dots as list item markers */
  ordered: boolean;
};

export type MediaOptions = {
  /** Reddit media ID provided after uploading media */
  mediaId: string;
  /** Media description */
  caption?: string;
  /**
   * If provided, the content should be blurred by default for the provided reason
   * @see {@link ObfuscationReason}
   */
  blur?: ObfuscationReason;
};

/**
 * @borrows RedditPermalinkOptions
 */
export type PostLinkOptions = RedditPermalinkOptions;

/**
 * @borrows PrefixedRedditLinkOptions
 */
export type PrefixedRedditLinkOptions = {
  /** Whether to render a type prefix on the link (such as "r/" or "u/") */
  showPrefix: boolean;
};

export type RedditPermalinkOptions = {
  /**
   * Permalink to a Reddit page
   * @example { permalink: "/r/aww/comments/z9m1yj/one_of_them_isnt_a_dog" }
   */
  permalink: string;
};

/**
 * @borrows PrefixedRedditLinkOptions
 */
export type SubredditLinkOptions = PrefixedRedditLinkOptions & {
  /**
   * Subreddit name without the "r/" prefix
   * @example { subredditName: "aww", showPrefix: true }
   */
  subredditName: string;
};

export type RawTextOptions = {
  text: string;
};

export type TableHeaderCellOptions = {
  /** Text alignment for the entire column */
  columnAlignment?: 'left' | 'right' | 'center';
};

/**
 * @borrows RawTextOptions
 */
export type TextOptions = RawTextOptions & {
  /**
   * A list of FormatRange specifications which defines text style for an
   * arbitrary substring within the text
   * @see {@link FormatRange}
   * @see {@link makeFormatting}
   * @example // Make the exclamation mark italic:
   * { text: 'Hello!', formatting: [makeFormatting({italic: true, startIndex: 5, length: 1})] }
   */
  formatting?: FormatRange[];
};

/**
 * @borrows PrefixedRedditLinkOptions
 */
export type UserLinkOptions = PrefixedRedditLinkOptions & {
  /**
   * Username the link should point to without "u/" prefix
   * @example { username: 'spez', showPrefix: true }
   */
  username: string;
};

/**
 * @borrows UserLinkOptions
 */
export type UserMentionOptions = UserLinkOptions;

/**
 * @borrows MediaOptions
 */
export type VideoOptions = MediaOptions & {
  /**
   * An {@link Image} element to use as the thumbnail before the video has loaded
   * @see {@link Image}
   * @see {makeImage}
   */
  thumbnail?: Image;
  /** Whether the video should be converted to a looping GIF */
  convertToGif?: boolean;
};
