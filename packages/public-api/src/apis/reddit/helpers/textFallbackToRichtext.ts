import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import type { CustomPostRichTextFallback, CustomPostTextFallbackOptions } from '../models/Post.js';

/** @internal */
export const getCustomPostRichTextFallback = (
  textFallbackOptions: CustomPostTextFallbackOptions
): string =>
  'text' in textFallbackOptions
    ? textToTextFallbackString(textFallbackOptions.text)
    : richTextToTextFallbackString(textFallbackOptions.richtext);

const textToTextFallbackString = (textFallback: string): string =>
  new RichTextBuilder()
    .paragraph((p) => {
      p.text({ text: textFallback });
    })
    .build();

const richTextToTextFallbackString = (textFallback: CustomPostRichTextFallback): string => {
  if (textFallback instanceof RichTextBuilder) {
    return textFallback.build();
  } else if (typeof textFallback === 'object') {
    return JSON.stringify(textFallback);
  }

  return textFallback;
};
