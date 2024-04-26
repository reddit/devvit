import { parse } from 'tldts';
import type { OnValidateHandler } from '@devvit/public-api';

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Any string will do, but expected to receive "🟩" or "🟥"
export function getCommentRichtext(
  visualTiles: string[],
  username: string
): Record<string, unknown> {
  return {
    document: [
      {
        c: [
          {
            e: 'text',
            t: `u/${username}'s bingo results:`,
          },
          {
            e: 'br',
          },
          {
            e: 'text',
            t: visualTiles.slice(0, 4).join(' '),
          },
          {
            e: 'br',
          },
          {
            e: 'text',
            t: visualTiles.slice(4, 8).join(' '),
          },
          {
            e: 'br',
          },
          {
            e: 'text',
            t: visualTiles.slice(8, 12).join(' '),
          },
          {
            e: 'br',
          },
          {
            e: 'text',
            t: visualTiles.slice(12, 16).join(' '),
          },
        ],
        e: 'par',
      },
    ],
  };
}

export const REDD_IT: string = 'redd.it';
export const REDDIT_STATIC: string = 'redditstatic.com';
export const REDDIT_MEDIA: string = 'redditmedia.com';
export const APPROVED_DOMAINS: string[] = [REDD_IT, REDDIT_STATIC, REDDIT_MEDIA];
export const ApprovedDomainsFormatted: string = APPROVED_DOMAINS.map(
  (domain) => `"${domain}"`
).join(', ');

export function isRedditImage(imageUrl: string | undefined): boolean {
  if (!imageUrl) {
    return true;
  }
  const domain = parse(imageUrl).domain;
  return APPROVED_DOMAINS.includes(domain || '');
}

export const validateImageUrlSetting: OnValidateHandler<string> = (event) => {
  if (!isRedditImage(event.value)) {
    return `Please use images from ${ApprovedDomainsFormatted}.`;
  }
};
