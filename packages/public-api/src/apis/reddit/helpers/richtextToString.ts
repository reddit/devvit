import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';

export function richtextToString(richtext: RichTextBuilder | object | string): string {
  let richtextString: string;

  if (richtext instanceof RichTextBuilder) {
    richtextString = richtext.build();
  } else if (typeof richtext === 'object') {
    richtextString = JSON.stringify(richtext);
  } else {
    richtextString = richtext;
  }

  return richtextString;
}
