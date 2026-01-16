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
  mixinEmbedContext,
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
  mixinVideoContext,
} from './mixins.js';
import type { TableRow } from './types.js';

describe('mixinBlockQuoteContext()', () => {
  test('pushes a block quote element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinBlockQuoteContext(context, content);
    let callCount = 0;
    const callback = (_blockQuote: BlockQuoteContext) => {
      callCount += 1;
    };

    const result = container.blockQuote({}, callback);

    expect(result).toBe(context);
    expect(callCount).toBe(1);
    expect(content).toStrictEqual([{ e: 'blockquote', c: [] }]);
  });
});

describe('mixinCodeBlockContext()', () => {
  test('pushes a code block element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinCodeBlockContext(context, content);
    let callCount = 0;
    const callback = (codeBlock: CodeBlockContext) => {
      callCount += 1;
      codeBlock.rawText('const x = 1;');
    };

    const result = container.codeBlock({ language: 'typescript' }, callback);

    expect(result).toBe(context);
    expect(callCount).toBe(1);
    expect(content).toStrictEqual([
      { e: 'code', c: [{ e: 'raw', t: 'const x = 1;' }], l: 'typescript' },
    ]);
  });
});

describe('mixinEmbedContext()', () => {
  test('pushes an embed element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinEmbedContext(context, content);

    const result = container.embed({
      sourceUrl: 'https://example.com/watch?v=abc',
      contentUrl: 'https://example.com/embed/abc',
      width: 640,
      height: 360,
    });

    expect(result).toBe(context);
    expect(content).toStrictEqual([
      {
        e: 'embed',
        u: 'https://example.com/watch?v=abc',
        c: 'https://example.com/embed/abc',
        x: 640,
        y: 360,
      },
    ]);
  });
});

describe('mixinHeadingContext()', () => {
  test('pushes a heading element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinHeadingContext(context, content);
    let callCount = 0;
    const callback = (heading: HeadingContext) => {
      callCount += 1;
      heading.rawText('Section title');
    };

    const result = container.heading({ level: 2 }, callback);

    expect(result).toBe(context);
    expect(callCount).toBe(1);
    expect(content).toStrictEqual([{ e: 'h', l: 2, c: [{ e: 'raw', t: 'Section title' }] }]);
  });
});

describe('mixinHorizontalRuleContext()', () => {
  test('pushes a horizontal rule element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinHorizontalRuleContext(context, content);

    const result = container.horizontalRule();

    expect(result).toBe(context);
    expect(content).toStrictEqual([{ e: 'hr' }]);
  });
});

describe('mixinImageContext()', () => {
  test('pushes image and animated image elements and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinImageContext(context, content);

    const imageResult = container.image({ mediaId: 'image-1' });
    const animatedResult = container.animatedImage({ mediaId: 'gif-1' });

    expect(imageResult).toBe(context);
    expect(animatedResult).toBe(context);
    expect(content).toStrictEqual([
      { e: 'img', id: 'image-1' },
      { e: 'gif', id: 'gif-1' },
    ]);
  });
});

describe('mixinLineBreakContext()', () => {
  test('pushes a line break element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinLineBreakContext(context, content);

    const result = container.linebreak();

    expect(result).toBe(context);
    expect(content).toStrictEqual([{ e: 'br' }]);
  });
});

describe('mixinLinkContext()', () => {
  test('pushes link elements and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinLinkContext(context, content);

    const linkResult = container.link({ text: 'Docs', url: 'https://example.com/docs' });
    const commentResult = container.commentLink({ permalink: '/r/test/comments/abc/post/xyz' });
    const postResult = container.postLink({ permalink: '/r/test/comments/abc/post' });
    const subredditResult = container.subredditLink({ subredditName: 'devvit', showPrefix: true });
    const userResult = container.userLink({ username: 'spez', showPrefix: true });
    const mentionResult = container.userMention({ username: 'automod', showPrefix: false });

    expect(linkResult).toBe(context);
    expect(commentResult).toBe(context);
    expect(postResult).toBe(context);
    expect(subredditResult).toBe(context);
    expect(userResult).toBe(context);
    expect(mentionResult).toBe(context);
    expect(content).toStrictEqual([
      { e: 'link', t: 'Docs', u: 'https://example.com/docs' },
      { e: 'c/', t: '/r/test/comments/abc/post/xyz' },
      { e: 'p/', t: '/r/test/comments/abc/post' },
      { e: 'r/', t: 'devvit', l: true },
      { e: 'u/', t: 'spez', l: true },
      { e: '@', t: 'automod', l: false },
    ]);
  });
});

describe('mixinListContext()', () => {
  test('pushes a list element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinListContext(context, content);
    let callCount = 0;
    const callback = (list: ListContext) => {
      callCount += 1;
      list.item(() => {});
    };

    const result = container.list({ ordered: true }, callback);

    expect(result).toBe(context);
    expect(callCount).toBe(1);
    expect(content).toStrictEqual([{ e: 'list', o: true, c: [{ e: 'li', c: [] }] }]);
  });
});

describe('mixinListItemContext()', () => {
  test('pushes a list item element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinListItemContext(context, content);
    let callCount = 0;
    const callback = (item: ListItemContext) => {
      callCount += 1;
      item.paragraph((paragraph) => paragraph.text({ text: 'First item' }));
    };

    const result = container.item(callback);

    expect(result).toBe(context);
    expect(callCount).toBe(1);
    expect(content).toStrictEqual([
      { e: 'li', c: [{ e: 'par', c: [{ e: 'text', t: 'First item' }] }] },
    ]);
  });
});

describe('mixinParagraphContext()', () => {
  test('pushes a paragraph element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinParagraphContext(context, content);
    let callCount = 0;
    const callback = (paragraph: ParagraphContext) => {
      callCount += 1;
      paragraph.text({ text: 'Hello' });
    };

    const result = container.paragraph(callback);

    expect(result).toBe(context);
    expect(callCount).toBe(1);
    expect(content).toStrictEqual([{ e: 'par', c: [{ e: 'text', t: 'Hello' }] }]);
  });
});

describe('mixinRawTextContext()', () => {
  test('pushes a raw text element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinRawTextContext(context, content);

    const result = container.rawText('raw text');

    expect(result).toBe(context);
    expect(content).toStrictEqual([{ e: 'raw', t: 'raw text' }]);
  });
});

describe('mixinSpoilerContext()', () => {
  test('pushes a spoiler text element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinSpoilerContext(context, content);
    let callCount = 0;
    const callback = (spoiler: SpoilerContext) => {
      callCount += 1;
      spoiler.text({ text: 'Hidden' });
    };

    const result = container.spoiler(callback);

    expect(result).toBe(context);
    expect(callCount).toBe(1);
    expect(content).toStrictEqual([{ e: 'spoilertext', c: [{ e: 'text', t: 'Hidden' }] }]);
  });
});

describe('mixinTableContentContext()', () => {
  test('pushes table header cells and rows and returns the context', () => {
    const context = { name: 'context' };
    const headerContent: unknown[] = [];
    const rowContent: unknown[] = [];
    const container = mixinTableContentContext(context, headerContent, rowContent);
    let headerCallCount = 0;
    let rowCallCount = 0;
    const headerCallback = (cell: TableHeaderCellContext) => {
      headerCallCount += 1;
      cell.text({ text: 'Header' });
    };
    const rowCallback = (row: TableRowContext) => {
      rowCallCount += 1;
      row.cell((cell) => cell.text({ text: 'Cell' }));
    };

    const headerResult = container.headerCell({ columnAlignment: 'center' }, headerCallback);
    const rowResult = container.row(rowCallback);

    expect(headerResult).toBe(context);
    expect(rowResult).toBe(context);
    expect(headerCallCount).toBe(1);
    expect(rowCallCount).toBe(1);
    expect(headerContent).toStrictEqual([{ a: 'C', c: [{ e: 'text', t: 'Header' }] }]);
    expect(rowContent).toStrictEqual([[{ c: [{ e: 'text', t: 'Cell' }] }]]);
  });
});

describe('mixinTableContext()', () => {
  test('pushes a table element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinTableContext(context, content);
    let callCount = 0;
    const callback = (table: TableContext) => {
      callCount += 1;
      table.headerCell({ columnAlignment: 'left' }, (cell) => cell.text({ text: 'Head' }));
      table.row((row) => row.cell((cell) => cell.text({ text: 'Body' })));
    };

    const result = container.table(callback);

    expect(result).toBe(context);
    expect(callCount).toBe(1);
    expect(content).toStrictEqual([
      {
        e: 'table',
        h: [{ a: 'L', c: [{ e: 'text', t: 'Head' }] }],
        c: [[{ c: [{ e: 'text', t: 'Body' }] }]],
      },
    ]);
  });
});

describe('mixinTableRowContext()', () => {
  test('pushes a table cell element and returns the context', () => {
    const context = { name: 'context' };
    const content: TableRow = [];
    const container = mixinTableRowContext(context, content);
    let callCount = 0;
    const callback = (cell: TableCellContext) => {
      callCount += 1;
      cell.text({ text: 'Cell' });
    };

    const result = container.cell(callback);

    expect(result).toBe(context);
    expect(callCount).toBe(1);
    expect(content).toStrictEqual([{ c: [{ e: 'text', t: 'Cell' }] }]);
  });
});

describe('mixinTextContext()', () => {
  test('splits text by newlines and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinTextContext(context, content);

    const result = container.text({ text: 'Line 1\n\nLine 2' });

    expect(result).toBe(context);
    expect(content).toStrictEqual([
      { e: 'text', t: 'Line 1' },
      { e: 'br' },
      { e: 'br' },
      { e: 'text', t: 'Line 2' },
    ]);
  });
});

describe('mixinVideoContext()', () => {
  test('pushes a video element and returns the context', () => {
    const context = { name: 'context' };
    const content: unknown[] = [];
    const container = mixinVideoContext(context, content);

    const result = container.video({ mediaId: 'video-1' });

    expect(result).toBe(context);
    expect(content).toStrictEqual([{ e: 'video', id: 'video-1' }]);
  });
});
