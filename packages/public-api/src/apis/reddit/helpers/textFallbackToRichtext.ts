import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import type { CustomPostRichTextFallback } from '../models/Post.js';

export const textToTextFallbackString = (textFallback: string): string =>
  new RichTextBuilder()
    .paragraph((p) => {
      p.text({ text: textFallback });
    })
    .build();

export const richTextToTextFallbackString = (textFallback: CustomPostRichTextFallback): string => {
  if (textFallback instanceof RichTextBuilder) {
    return textFallback.build();
  } else if (typeof textFallback === 'object') {
    return JSON.stringify(textFallback);
  }

  return textFallback;
};
