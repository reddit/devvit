import { RichTextBuilder } from './RichTextBuilder.js';

describe('build()', () => {
  test('returns an empty document when nothing is added', () => {
    const builder = new RichTextBuilder();
    const result = JSON.parse(builder.build());

    expect(result).toStrictEqual({ document: [] });
  });

  test('builds a paragraph with text containing trailing newlines and an image', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: 'hello world 12345678' + '\n\n' });
    });
    builder.image({ mediaId: 'test-media-id' });

    const result = JSON.parse(builder.build());

    expect(result).toStrictEqual({
      document: [
        {
          e: 'par',
          c: [{ e: 'text', t: 'hello world 12345678' }, { e: 'br' }, { e: 'br' }],
        },
        {
          e: 'img',
          id: 'test-media-id',
        },
      ],
    });
  });

  test('builds a paragraph with text, line breaks, and an image', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: 'abc' + '\n\n' + 'def' });
    });
    builder.image({ mediaId: 'test-media-id' });

    const result = JSON.parse(builder.build());

    expect(result).toStrictEqual({
      document: [
        {
          e: 'par',
          c: [{ e: 'text', t: 'abc' }, { e: 'br' }, { e: 'br' }, { e: 'text', t: 'def' }],
        },
        {
          e: 'img',
          id: 'test-media-id',
        },
      ],
    });
  });
});

describe('paragraph()', () => {
  test('creates a paragraph with plain text', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: 'Hello, world!' });
    });

    const result = JSON.parse(builder.build());

    expect(result.document).toHaveLength(1);
    expect(result.document[0]).toStrictEqual({
      e: 'par',
      c: [{ e: 'text', t: 'Hello, world!' }],
    });
  });

  test('supports chaining multiple paragraphs', () => {
    const builder = new RichTextBuilder();
    builder
      .paragraph((paragraph) => {
        paragraph.text({ text: 'First paragraph' });
      })
      .paragraph((paragraph) => {
        paragraph.text({ text: 'Second paragraph' });
      });

    const result = JSON.parse(builder.build());

    expect(result.document).toHaveLength(2);
    const elements = ['First paragraph', 'Second paragraph'];
    for (const [index, expectedText] of elements.entries())
      expect(result.document[index].c[0].t).toBe(expectedText);
  });

  test('supports explicit linebreaks within a paragraph', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: 'Before break' }).linebreak().text({ text: 'After break' });
    });

    const result = JSON.parse(builder.build());
    const paragraphContent = result.document[0].c;

    expect(paragraphContent).toHaveLength(3);
    expect(paragraphContent[0]).toStrictEqual({ e: 'text', t: 'Before break' });
    expect(paragraphContent[1]).toStrictEqual({ e: 'br' });
    expect(paragraphContent[2]).toStrictEqual({ e: 'text', t: 'After break' });
  });

  test('converts single newline in text to linebreak element', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: 'hello\nworld' });
    });

    const result = JSON.parse(builder.build());
    const paragraphContent = result.document[0].c;

    expect(paragraphContent).toStrictEqual([
      { e: 'text', t: 'hello' },
      { e: 'br' },
      { e: 'text', t: 'world' },
    ]);
  });

  test('converts Windows newline in text to linebreak element', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: 'hello\r\nworld' });
    });

    const result = JSON.parse(builder.build());
    const paragraphContent = result.document[0].c;

    expect(paragraphContent).toStrictEqual([
      { e: 'text', t: 'hello' },
      { e: 'br' },
      { e: 'text', t: 'world' },
    ]);
  });

  test('converts multiple consecutive newlines to multiple linebreak elements', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: 'hello\n\nworld' });
    });

    const result = JSON.parse(builder.build());
    const paragraphContent = result.document[0].c;

    expect(paragraphContent).toStrictEqual([
      { e: 'text', t: 'hello' },
      { e: 'br' },
      { e: 'br' },
      { e: 'text', t: 'world' },
    ]);
  });

  test('converts multiple windows newlines to multiple linebreak elements', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: 'hello\r\n\r\nworld' });
    });

    const result = JSON.parse(builder.build());
    const paragraphContent = result.document[0].c;

    expect(paragraphContent).toStrictEqual([
      { e: 'text', t: 'hello' },
      { e: 'br' },
      { e: 'br' },
      { e: 'text', t: 'world' },
    ]);
  });

  test('handles leading newlines in text', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: '\n\nhello' });
    });

    const result = JSON.parse(builder.build());
    const paragraphContent = result.document[0].c;

    expect(paragraphContent).toStrictEqual([{ e: 'br' }, { e: 'br' }, { e: 'text', t: 'hello' }]);
  });

  test('handles text that is only newlines', () => {
    const builder = new RichTextBuilder();
    builder.paragraph((paragraph) => {
      paragraph.text({ text: '\n' });
    });

    const result = JSON.parse(builder.build());
    const paragraphContent = result.document[0].c;

    expect(paragraphContent).toStrictEqual([{ e: 'br' }]);
  });
});

describe('image()', () => {
  test('creates an image element with mediaId', () => {
    const builder = new RichTextBuilder();
    builder.image({ mediaId: 'abc123' });

    const result = JSON.parse(builder.build());

    expect(result.document[0]).toStrictEqual({
      e: 'img',
      id: 'abc123',
    });
  });

  test('includes caption when provided', () => {
    const builder = new RichTextBuilder();
    builder.image({ mediaId: 'abc123', caption: 'A lovely cat' });

    const result = JSON.parse(builder.build());

    expect(result.document[0]).toStrictEqual({
      e: 'img',
      id: 'abc123',
      c: 'A lovely cat',
    });
  });

  test('includes blur reason when provided', () => {
    const builder = new RichTextBuilder();
    builder.image({ mediaId: 'abc123', blur: 'nsfw' });

    const result = JSON.parse(builder.build());

    expect(result.document[0]).toStrictEqual({
      e: 'img',
      id: 'abc123',
      o: 'nsfw',
    });
  });
});

describe('horizontalRule()', () => {
  test('creates a horizontal rule element', () => {
    const builder = new RichTextBuilder();
    builder.horizontalRule();

    const result = JSON.parse(builder.build());

    expect(result.document[0]).toStrictEqual({ e: 'hr' });
  });
});
