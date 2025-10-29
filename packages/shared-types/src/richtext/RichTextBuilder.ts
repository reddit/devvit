import type {
  BlockQuoteContainer,
  CodeBlockContainer,
  EmbedContainer,
  HeadingContainer,
  HorizontalRuleContainer,
  ImageContainer,
  ListContainer,
  ParagraphContainer,
  TableContainer,
  VideoContainer,
} from './containers.js';
import type {
  BlockQuoteContext,
  CodeBlockContext,
  HeadingContext,
  ListContext,
  ParagraphContext,
  TableContext,
} from './contexts.js';
import {
  mixinBlockQuoteContext,
  mixinCodeBlockContext,
  mixinEmbedContext,
  mixinHeadingContext,
  mixinHorizontalRuleContext,
  mixinImageContext,
  mixinListContext,
  mixinParagraphContext,
  mixinTableContext,
  mixinVideoContext,
} from './mixins.js';
import type {
  BlockQuoteOptions,
  CodeBlockOptions,
  EmbedOptions,
  HeadingOptions,
  ImageOptions,
  ListOptions,
  VideoOptions,
} from './options.js';
import type { DocumentNode, RichTextContent } from './types.js';

/**
 * @mixes ParagraphContainer
 * @mixes HeadingContainer
 * @mixes HorizontalRuleContainer
 * @mixes BlockQuoteContainer
 * @mixes CodeBlockContainer
 * @mixes EmbedContainer
 * @mixes ListContainer
 * @mixes TableContainer
 * @mixes ImageContainer
 * @mixes VideoContainer
 */
export class RichTextBuilder
  implements
    ParagraphContainer<RichTextBuilder>,
    HeadingContainer<RichTextBuilder>,
    HorizontalRuleContainer<RichTextBuilder>,
    BlockQuoteContainer<RichTextBuilder>,
    CodeBlockContainer<RichTextBuilder>,
    EmbedContainer<RichTextBuilder>,
    ListContainer<RichTextBuilder>,
    TableContainer<RichTextBuilder>,
    ImageContainer<RichTextBuilder>,
    VideoContainer<RichTextBuilder>
{
  readonly #content: RichTextContent;

  constructor() {
    const content: DocumentNode[] = [];
    Object.assign(
      this,
      mixinParagraphContext(this, content),
      mixinHeadingContext(this, content),
      mixinHorizontalRuleContext(this, content),
      mixinBlockQuoteContext(this, content),
      mixinCodeBlockContext(this, content),
      mixinEmbedContext(this, content),
      mixinListContext(this, content),
      mixinTableContext(this, content),
      mixinImageContext(this, content),
      mixinVideoContext(this, content)
    );

    this.#content = {
      document: content,
    };
  }

  /**
   * Serializes the document to a JSON string
   */
  build(): string {
    return JSON.stringify(this.#content);
  }

  // #region Empty interface methods

  /* These are here to satisfy the interfaces but are overwritten by the mixins in the constructor */
  paragraph(_cb: (paragraph: ParagraphContext) => void): RichTextBuilder {
    return this;
  }

  heading(_opts: HeadingOptions, _cb: (heading: HeadingContext) => void): RichTextBuilder {
    return this;
  }

  horizontalRule(): RichTextBuilder {
    return this;
  }

  blockQuote(
    _opts: BlockQuoteOptions,
    _cb: (blockQuote: BlockQuoteContext) => void
  ): RichTextBuilder {
    return this;
  }

  codeBlock(_opts: CodeBlockOptions, _cb: (codeBlock: CodeBlockContext) => void): RichTextBuilder {
    return this;
  }

  embed(_opts: EmbedOptions): RichTextBuilder {
    return this;
  }

  list(_opts: ListOptions, _cb: (list: ListContext) => void): RichTextBuilder {
    return this;
  }

  table(_cb: (table: TableContext) => void): RichTextBuilder {
    return this;
  }

  image(_opts: ImageOptions): RichTextBuilder {
    return this;
  }

  animatedImage(_opts: ImageOptions): RichTextBuilder {
    return this;
  }

  video(_opts: VideoOptions): RichTextBuilder {
    return this;
  }

  // #endregion
}
