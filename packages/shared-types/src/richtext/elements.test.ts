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
  TableRowContext,
} from './contexts.js';
import {
  makeAnimatedImage,
  makeBlockQuote,
  makeCodeBlock,
  makeCommentLink,
  makeEmbed,
  makeFormatting,
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
  ImageOptions,
  LinkOptions,
  TextOptions,
  VideoOptions,
} from './options.js';
import type { FormatRange, TextNode } from './types.js';

const testMediaUrl = 'https://example.com/media.gif';
const testImageUrl = 'https://example.com/image.png';

describe('makeAnimatedImage()', () => {
  const testCases: { name: string; opts: ImageOptions; expected: unknown }[] = [
    {
      name: 'with mediaUrl only',
      opts: { mediaUrl: testMediaUrl },
      expected: { e: 'gif', mediaUrl: testMediaUrl },
    },
    {
      name: 'with caption',
      opts: { mediaUrl: testMediaUrl, caption: 'Funny cat' },
      expected: { e: 'gif', mediaUrl: testMediaUrl, c: 'Funny cat' },
    },
    {
      name: 'with blur',
      opts: { mediaUrl: testMediaUrl, blur: 'nsfw' },
      expected: { e: 'gif', mediaUrl: testMediaUrl, o: 'nsfw' },
    },
    {
      name: 'with all options',
      opts: { mediaUrl: testMediaUrl, caption: 'Funny cat', blur: 'spoiler' },
      expected: { e: 'gif', mediaUrl: testMediaUrl, c: 'Funny cat', o: 'spoiler' },
    },
  ];

  for (const { name, opts, expected } of testCases)
    test(name, () => {
      expect(makeAnimatedImage(opts)).toStrictEqual(expected);
    });
});

describe('makeBlockQuote()', () => {
  const testCases: {
    name: string;
    opts: BlockQuoteOptions;
    callback: (ctx: BlockQuoteContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty blockquote',
      opts: {},
      callback: () => {},
      expected: { e: 'blockquote', c: [] },
    },
    {
      name: 'with paragraph',
      opts: {},
      callback: (ctx) => ctx.paragraph((p) => p.text({ text: 'quoted text' })),
      expected: { e: 'blockquote', c: [{ e: 'par', c: [{ e: 'text', t: 'quoted text' }] }] },
    },
    {
      name: 'with author',
      opts: { author: { e: 'text', t: 'someone' } as TextNode },
      callback: () => {},
      expected: { e: 'blockquote', c: [], a: { e: 'text', t: 'someone' } },
    },
  ];

  for (const { name, opts, callback, expected } of testCases)
    test(name, () => {
      expect(makeBlockQuote(opts, callback)).toStrictEqual(expected);
    });
});

describe('makeCodeBlock()', () => {
  const testCases: {
    name: string;
    opts: { language?: string };
    callback: (ctx: CodeBlockContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty code block',
      opts: {},
      callback: () => {},
      expected: { e: 'code', c: [] },
    },
    {
      name: 'with raw text',
      opts: {},
      callback: (ctx) => ctx.rawText('const x = 1;'),
      expected: { e: 'code', c: [{ e: 'raw', t: 'const x = 1;' }] },
    },
    {
      name: 'with language',
      opts: { language: 'javascript' },
      callback: (ctx) => ctx.rawText('const x = 1;'),
      expected: { e: 'code', c: [{ e: 'raw', t: 'const x = 1;' }], l: 'javascript' },
    },
  ];

  for (const { name, opts, callback, expected } of testCases)
    test(name, () => {
      expect(makeCodeBlock(opts, callback)).toStrictEqual(expected);
    });
});

describe('makeCommentLink()', () => {
  test('creates comment link with permalink', () => {
    expect(makeCommentLink({ permalink: '/r/test/comments/abc/post/xyz' })).toStrictEqual({
      e: 'c/',
      t: '/r/test/comments/abc/post/xyz',
    });
  });
});

describe('makeEmbed()', () => {
  test('creates embed with all required fields', () => {
    expect(
      makeEmbed({
        sourceUrl: 'https://youtube.com/watch?v=abc',
        contentUrl: 'https://youtube.com/embed/abc',
        width: 560,
        height: 315,
      })
    ).toStrictEqual({
      e: 'embed',
      u: 'https://youtube.com/watch?v=abc',
      c: 'https://youtube.com/embed/abc',
      x: 560,
      y: 315,
    });
  });
});

describe('makeFormatting()', () => {
  const testCases: {
    name: string;
    opts: {
      bold?: boolean;
      italic?: boolean;
      monospace?: boolean;
      strikethrough?: boolean;
      subscript?: boolean;
      superscript?: boolean;
      underline?: boolean;
      startIndex: number;
      length: number;
    };
    expected: [number, number, number];
  }[] = [
    {
      name: 'bold',
      opts: { bold: true, startIndex: 0, length: 5 },
      expected: [1, 0, 5],
    },
    {
      name: 'italic',
      opts: { italic: true, startIndex: 0, length: 5 },
      expected: [2, 0, 5],
    },
    {
      name: 'underline',
      opts: { underline: true, startIndex: 0, length: 5 },
      expected: [4, 0, 5],
    },
    {
      name: 'strikethrough',
      opts: { strikethrough: true, startIndex: 0, length: 5 },
      expected: [8, 0, 5],
    },
    {
      name: 'subscript',
      opts: { subscript: true, startIndex: 0, length: 5 },
      expected: [16, 0, 5],
    },
    {
      name: 'superscript',
      opts: { superscript: true, startIndex: 0, length: 5 },
      expected: [32, 0, 5],
    },
    {
      name: 'monospace',
      opts: { monospace: true, startIndex: 0, length: 5 },
      expected: [64, 0, 5],
    },
    {
      name: 'bold and italic combined',
      opts: { bold: true, italic: true, startIndex: 2, length: 10 },
      expected: [3, 2, 10],
    },
    {
      name: 'no formatting',
      opts: { startIndex: 0, length: 5 },
      expected: [0, 0, 5],
    },
  ];

  for (const { name, opts, expected } of testCases)
    test(name, () => {
      expect(makeFormatting(opts)).toStrictEqual(expected);
    });
});

describe('makeHeadingContext()', () => {
  const testCases: {
    name: string;
    opts: { level: 1 | 2 | 3 | 4 | 5 | 6 };
    callback: (ctx: HeadingContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty h1',
      opts: { level: 1 },
      callback: () => {},
      expected: { e: 'h', l: 1, c: [] },
    },
    {
      name: 'h2 with raw text',
      opts: { level: 2 },
      callback: (ctx) => ctx.rawText('Section Title'),
      expected: { e: 'h', l: 2, c: [{ e: 'raw', t: 'Section Title' }] },
    },
    {
      name: 'h3 with link',
      opts: { level: 3 },
      callback: (ctx) => ctx.link({ text: 'Click here', url: 'https://example.com' }),
      expected: { e: 'h', l: 3, c: [{ e: 'link', t: 'Click here', u: 'https://example.com' }] },
    },
  ];

  for (const { name, opts, callback, expected } of testCases)
    test(name, () => {
      expect(makeHeadingContext(opts, callback)).toStrictEqual(expected);
    });
});

describe('makeHorizontalRule()', () => {
  test('creates horizontal rule', () => {
    expect(makeHorizontalRule()).toStrictEqual({ e: 'hr' });
  });
});

describe('makeImage()', () => {
  const testCases: { name: string; opts: ImageOptions; expected: unknown }[] = [
    {
      name: 'with mediaUrl only',
      opts: { mediaUrl: testImageUrl },
      expected: { e: 'img', mediaUrl: testImageUrl },
    },
    {
      name: 'with caption',
      opts: { mediaUrl: testImageUrl, caption: 'A photo' },
      expected: { e: 'img', mediaUrl: testImageUrl, c: 'A photo' },
    },
    {
      name: 'with blur',
      opts: { mediaUrl: testImageUrl, blur: 'nsfw' },
      expected: { e: 'img', mediaUrl: testImageUrl, o: 'nsfw' },
    },
    {
      name: 'with all options',
      opts: { mediaUrl: testImageUrl, caption: 'A photo', blur: 'spoiler' },
      expected: { e: 'img', mediaUrl: testImageUrl, c: 'A photo', o: 'spoiler' },
    },
  ];

  for (const { name, opts, expected } of testCases)
    test(name, () => {
      expect(makeImage(opts)).toStrictEqual(expected);
    });
});

describe('makeLineBreak()', () => {
  test('creates line break', () => {
    expect(makeLineBreak()).toStrictEqual({ e: 'br' });
  });
});

describe('makeLink()', () => {
  const testCases: {
    name: string;
    opts: LinkOptions;
    expected: unknown;
  }[] = [
    {
      name: 'basic link',
      opts: { text: 'Click me', url: 'https://example.com' },
      expected: { e: 'link', t: 'Click me', u: 'https://example.com' },
    },
    {
      name: 'with tooltip',
      opts: { text: 'Click me', url: 'https://example.com', tooltip: 'Go to example' },
      expected: { e: 'link', t: 'Click me', u: 'https://example.com', a: 'Go to example' },
    },
    {
      name: 'with formatting',
      opts: {
        text: 'Click me',
        url: 'https://example.com',
        formatting: [[1, 0, 5]] as FormatRange[],
      },
      expected: { e: 'link', t: 'Click me', u: 'https://example.com', f: [[1, 0, 5]] },
    },
  ];

  for (const { name, opts, expected } of testCases)
    test(name, () => {
      expect(makeLink(opts)).toStrictEqual(expected);
    });
});

describe('makeList()', () => {
  const testCases: {
    name: string;
    opts: { ordered: boolean };
    callback: (ctx: ListContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty unordered list',
      opts: { ordered: false },
      callback: () => {},
      expected: { e: 'list', o: false, c: [] },
    },
    {
      name: 'empty ordered list',
      opts: { ordered: true },
      callback: () => {},
      expected: { e: 'list', o: true, c: [] },
    },
    {
      name: 'with items',
      opts: { ordered: false },
      callback: (ctx) => {
        ctx.item((item) => item.paragraph((p) => p.text({ text: 'first' })));
        ctx.item((item) => item.paragraph((p) => p.text({ text: 'second' })));
      },
      expected: {
        e: 'list',
        o: false,
        c: [
          { e: 'li', c: [{ e: 'par', c: [{ e: 'text', t: 'first' }] }] },
          { e: 'li', c: [{ e: 'par', c: [{ e: 'text', t: 'second' }] }] },
        ],
      },
    },
  ];

  for (const { name, opts, callback, expected } of testCases)
    test(name, () => {
      expect(makeList(opts, callback)).toStrictEqual(expected);
    });
});

describe('makeListItem()', () => {
  const testCases: {
    name: string;
    callback: (ctx: ListItemContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty item',
      callback: () => {},
      expected: { e: 'li', c: [] },
    },
    {
      name: 'with paragraph',
      callback: (ctx) => ctx.paragraph((p) => p.text({ text: 'item text' })),
      expected: { e: 'li', c: [{ e: 'par', c: [{ e: 'text', t: 'item text' }] }] },
    },
    {
      name: 'with nested list',
      callback: (ctx) => ctx.list({ ordered: true }, (list) => list.item(() => {})),
      expected: { e: 'li', c: [{ e: 'list', o: true, c: [{ e: 'li', c: [] }] }] },
    },
  ];

  for (const { name, callback, expected } of testCases)
    test(name, () => {
      expect(makeListItem(callback)).toStrictEqual(expected);
    });
});

describe('makeParagraph()', () => {
  const testCases: {
    name: string;
    callback: (ctx: ParagraphContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty paragraph',
      callback: () => {},
      expected: { e: 'par', c: [] },
    },
    {
      name: 'with text',
      callback: (ctx) => ctx.text({ text: 'Hello world' }),
      expected: { e: 'par', c: [{ e: 'text', t: 'Hello world' }] },
    },
    {
      name: 'with newlines converted to linebreaks',
      callback: (ctx) => ctx.text({ text: 'line1\nline2' }),
      expected: {
        e: 'par',
        c: [{ e: 'text', t: 'line1' }, { e: 'br' }, { e: 'text', t: 'line2' }],
      },
    },
    {
      name: 'with link',
      callback: (ctx) => ctx.link({ text: 'click', url: 'https://example.com' }),
      expected: { e: 'par', c: [{ e: 'link', t: 'click', u: 'https://example.com' }] },
    },
    {
      name: 'with image',
      callback: (ctx) => ctx.image({ mediaUrl: testImageUrl }),
      expected: { e: 'par', c: [{ e: 'img', mediaUrl: testImageUrl }] },
    },
  ];

  for (const { name, callback, expected } of testCases)
    test(name, () => {
      expect(makeParagraph(callback)).toStrictEqual(expected);
    });
});

describe('makePostLink()', () => {
  test('creates post link with permalink', () => {
    expect(makePostLink({ permalink: '/r/test/comments/abc/post_title' })).toStrictEqual({
      e: 'p/',
      t: '/r/test/comments/abc/post_title',
    });
  });
});

describe('makeRawText()', () => {
  test('creates raw text element', () => {
    expect(makeRawText('some raw text')).toStrictEqual({ e: 'raw', t: 'some raw text' });
  });
});

describe('makeSpoilerText()', () => {
  const testCases: {
    name: string;
    callback: (ctx: SpoilerContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty spoiler',
      callback: () => {},
      expected: { e: 'spoilertext', c: [] },
    },
    {
      name: 'with text',
      callback: (ctx) => ctx.text({ text: 'hidden content' }),
      expected: { e: 'spoilertext', c: [{ e: 'text', t: 'hidden content' }] },
    },
    {
      name: 'with link',
      callback: (ctx) => ctx.link({ text: 'secret link', url: 'https://example.com' }),
      expected: {
        e: 'spoilertext',
        c: [{ e: 'link', t: 'secret link', u: 'https://example.com' }],
      },
    },
  ];

  for (const { name, callback, expected } of testCases)
    test(name, () => {
      expect(makeSpoilerText(callback)).toStrictEqual(expected);
    });
});

describe('makeSubredditLink()', () => {
  const testCases: {
    name: string;
    opts: { subredditName: string; showPrefix: boolean };
    expected: unknown;
  }[] = [
    {
      name: 'with prefix',
      opts: { subredditName: 'aww', showPrefix: true },
      expected: { e: 'r/', t: 'aww', l: true },
    },
    {
      name: 'without prefix',
      opts: { subredditName: 'aww', showPrefix: false },
      expected: { e: 'r/', t: 'aww', l: false },
    },
  ];

  for (const { name, opts, expected } of testCases)
    test(name, () => {
      expect(makeSubredditLink(opts)).toStrictEqual(expected);
    });
});

describe('makeTable()', () => {
  const testCases: {
    name: string;
    callback: (ctx: TableContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty table',
      callback: () => {},
      expected: { e: 'table', h: [], c: [] },
    },
    {
      name: 'with header cells',
      callback: (ctx) => {
        ctx.headerCell({}, (cell) => cell.text({ text: 'Col 1' }));
        ctx.headerCell({}, (cell) => cell.text({ text: 'Col 2' }));
      },
      expected: {
        e: 'table',
        h: [{ c: [{ e: 'text', t: 'Col 1' }] }, { c: [{ e: 'text', t: 'Col 2' }] }],
        c: [],
      },
    },
    {
      name: 'with rows',
      callback: (ctx) => {
        ctx.row((row) => row.cell((cell) => cell.text({ text: 'A1' })));
      },
      expected: {
        e: 'table',
        h: [],
        c: [[{ c: [{ e: 'text', t: 'A1' }] }]],
      },
    },
  ];

  for (const { name, callback, expected } of testCases)
    test(name, () => {
      expect(makeTable(callback)).toStrictEqual(expected);
    });
});

describe('makeTableCell()', () => {
  const testCases: {
    name: string;
    callback: (cell: TableCellContext) => void;
    expected: { c?: unknown[] };
  }[] = [
    {
      name: 'empty cell',
      callback: () => {},
      expected: { c: [] },
    },
    {
      name: 'cell with plain text',
      callback: (cell) => cell.text({ text: 'hello' }),
      expected: { c: [{ e: 'text', t: 'hello' }] },
    },
    {
      name: 'cell with text containing newlines',
      callback: (cell) => cell.text({ text: 'line1\nline2' }),
      expected: { c: [{ e: 'text', t: 'line1' }, { e: 'br' }, { e: 'text', t: 'line2' }] },
    },
    {
      name: 'cell with link',
      callback: (cell) => cell.link({ text: 'click me', url: 'https://reddit.com' }),
      expected: { c: [{ e: 'link', t: 'click me', u: 'https://reddit.com' }] },
    },
    {
      name: 'cell with image',
      callback: (cell) => cell.image({ mediaUrl: testImageUrl }),
      expected: { c: [{ e: 'img', mediaUrl: testImageUrl }] },
    },
    {
      name: 'cell with multiple elements',
      callback: (cell) => {
        cell.text({ text: 'before ' });
        cell.link({ text: 'link', url: 'https://example.com' });
        cell.text({ text: ' after' });
      },
      expected: {
        c: [
          { e: 'text', t: 'before ' },
          { e: 'link', t: 'link', u: 'https://example.com' },
          { e: 'text', t: ' after' },
        ],
      },
    },
  ];

  for (const { name, callback, expected } of testCases)
    test(name, () => {
      expect(makeTableCell(callback)).toStrictEqual(expected);
    });
});

describe('makeTableHeaderCell()', () => {
  const testCases: {
    name: string;
    opts: { columnAlignment?: 'left' | 'right' | 'center' };
    callback: (cell: TableCellContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty header cell',
      opts: {},
      callback: () => {},
      expected: { c: [] },
    },
    {
      name: 'with text',
      opts: {},
      callback: (cell) => cell.text({ text: 'Header' }),
      expected: { c: [{ e: 'text', t: 'Header' }] },
    },
    {
      name: 'left aligned',
      opts: { columnAlignment: 'left' },
      callback: (cell) => cell.text({ text: 'Header' }),
      expected: { a: 'L', c: [{ e: 'text', t: 'Header' }] },
    },
    {
      name: 'center aligned',
      opts: { columnAlignment: 'center' },
      callback: (cell) => cell.text({ text: 'Header' }),
      expected: { a: 'C', c: [{ e: 'text', t: 'Header' }] },
    },
    {
      name: 'right aligned',
      opts: { columnAlignment: 'right' },
      callback: (cell) => cell.text({ text: 'Header' }),
      expected: { a: 'R', c: [{ e: 'text', t: 'Header' }] },
    },
  ];

  for (const { name, opts, callback, expected } of testCases)
    test(name, () => {
      expect(makeTableHeaderCell(opts, callback)).toStrictEqual(expected);
    });
});

describe('makeTableRow()', () => {
  const testCases: {
    name: string;
    callback: (ctx: TableRowContext) => void;
    expected: unknown;
  }[] = [
    {
      name: 'empty row',
      callback: () => {},
      expected: [],
    },
    {
      name: 'with cells',
      callback: (ctx) => {
        ctx.cell((cell) => cell.text({ text: 'A' }));
        ctx.cell((cell) => cell.text({ text: 'B' }));
      },
      expected: [{ c: [{ e: 'text', t: 'A' }] }, { c: [{ e: 'text', t: 'B' }] }],
    },
  ];

  for (const { name, callback, expected } of testCases)
    test(name, () => {
      expect(makeTableRow(callback)).toStrictEqual(expected);
    });
});

describe('makeText()', () => {
  const testCases: {
    name: string;
    opts: TextOptions;
    expected: unknown;
  }[] = [
    {
      name: 'plain text',
      opts: { text: 'hello' },
      expected: { e: 'text', t: 'hello' },
    },
    {
      name: 'with formatting',
      opts: { text: 'hello', formatting: [[1, 0, 5]] as FormatRange[] },
      expected: { e: 'text', t: 'hello', f: [[1, 0, 5]] },
    },
  ];

  for (const { name, opts, expected } of testCases)
    test(name, () => {
      expect(makeText(opts)).toStrictEqual(expected);
    });
});

describe('makeUserLink()', () => {
  const testCases: {
    name: string;
    opts: { username: string; showPrefix: boolean };
    expected: unknown;
  }[] = [
    {
      name: 'with prefix',
      opts: { username: 'spez', showPrefix: true },
      expected: { e: 'u/', t: 'spez', l: true },
    },
    {
      name: 'without prefix',
      opts: { username: 'spez', showPrefix: false },
      expected: { e: 'u/', t: 'spez', l: false },
    },
  ];

  for (const { name, opts, expected } of testCases)
    test(name, () => {
      expect(makeUserLink(opts)).toStrictEqual(expected);
    });
});

describe('makeUserMention()', () => {
  const testCases: {
    name: string;
    opts: { username: string; showPrefix: boolean };
    expected: unknown;
  }[] = [
    {
      name: 'with prefix',
      opts: { username: 'spez', showPrefix: true },
      expected: { e: '@', t: 'spez', l: true },
    },
    {
      name: 'without prefix',
      opts: { username: 'spez', showPrefix: false },
      expected: { e: '@', t: 'spez', l: false },
    },
  ];

  for (const { name, opts, expected } of testCases)
    test(name, () => {
      expect(makeUserMention(opts)).toStrictEqual(expected);
    });
});

const testVideoUrl = 'https://example.com/video.mp4';
const testThumbUrl = 'https://example.com/thumb.png';

describe('makeVideo()', () => {
  const testCases: { name: string; opts: VideoOptions; expected: unknown }[] = [
    {
      name: 'with mediaUrl only',
      opts: { mediaUrl: testVideoUrl },
      expected: { e: 'video', mediaUrl: testVideoUrl },
    },
    {
      name: 'with caption',
      opts: { mediaUrl: testVideoUrl, caption: 'Cool video' },
      expected: { e: 'video', mediaUrl: testVideoUrl, c: 'Cool video' },
    },
    {
      name: 'with blur',
      opts: { mediaUrl: testVideoUrl, blur: 'nsfw' },
      expected: { e: 'video', mediaUrl: testVideoUrl, o: 'nsfw' },
    },
    {
      name: 'with thumbnail',
      opts: { mediaUrl: testVideoUrl, thumbnail: { e: 'img', mediaUrl: testThumbUrl } },
      expected: { e: 'video', mediaUrl: testVideoUrl, p: { e: 'img', mediaUrl: testThumbUrl } },
    },
    {
      name: 'with convertToGif',
      opts: { mediaUrl: testVideoUrl, convertToGif: true },
      expected: { e: 'video', mediaUrl: testVideoUrl, gifify: true },
    },
    {
      name: 'with all options',
      opts: {
        mediaUrl: testVideoUrl,
        caption: 'Cool video',
        blur: 'spoiler',
        thumbnail: { e: 'img', mediaUrl: testThumbUrl },
        convertToGif: true,
      },
      expected: {
        e: 'video',
        mediaUrl: testVideoUrl,
        c: 'Cool video',
        o: 'spoiler',
        p: { e: 'img', mediaUrl: testThumbUrl },
        gifify: true,
      },
    },
  ];

  for (const { name, opts, expected } of testCases)
    test(name, () => {
      expect(makeVideo(opts)).toStrictEqual(expected);
    });
});
