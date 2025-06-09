import type { OnValidateHandler } from '@devvit/public-api';
import { parse } from 'tldts';

import type { TileItem } from '../types.js';
import {
  Col1,
  Col2,
  Col3,
  Col4,
  Diagonal1,
  Diagonal2,
  Row1,
  Row2,
  Row3,
  Row4,
} from './boardPatterns.js';

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
  matches: MatchesResponse
): Record<string, unknown> {
  const boardVisual = {
    c: [
      {
        e: 'text',
        t: `My board:`,
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
  };
  const bingoFooter = {
    c: [
      {
        e: 'text',
        t: 'Posted via the Bingo App',
      },
    ],
    e: 'par',
  };
  const matchesText = [];
  if (matches.type === 'rows') {
    const rows: unknown[] = [];
    matches.matches.forEach((match, index) => {
      if (index > 0) {
        rows.push({
          e: 'br',
        });
      }
      rows.push({
        e: 'text',
        t: 'Winning row: ',
      });
      rows.push({
        c: [
          {
            e: 'text',
            t: match.join(', '),
          },
        ],
        e: 'spoilertext',
      });
    });
    matchesText.push({
      c: rows,
      e: 'par',
    });
  }
  if (matches.type === 'blackout') {
    matchesText.push({
      c: [
        {
          e: 'text',
          t: 'Blackout win:',
        },
        {
          e: 'br',
        },
        {
          c: [
            {
              e: 'text',
              t: matches.matches[0].join(', '),
            },
          ],
          e: 'spoilertext',
        },
        {
          e: 'br',
        },
        {
          c: [
            {
              e: 'text',
              t: matches.matches[1].join(', '),
            },
          ],
          e: 'spoilertext',
        },
        {
          e: 'br',
        },
        {
          c: [
            {
              e: 'text',
              t: matches.matches[2].join(', '),
            },
          ],
          e: 'spoilertext',
        },
        {
          e: 'br',
        },
        {
          c: [
            {
              e: 'text',
              t: matches.matches[3].join(', '),
            },
          ],
          e: 'spoilertext',
        },
      ],
      e: 'par',
    });
  }
  return {
    document: [boardVisual, ...matchesText, bingoFooter],
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

export function fillColumns<T>(
  columnCount: number,
  rowCount: number,
  items: T[],
  page: number = 0
): T[][] {
  const itemsOnPage = columnCount * rowCount;
  const startIndex = page * itemsOnPage;

  const columns: T[][] = Array(columnCount)
    .fill(null)
    .map(() => []);
  for (let i = 0; i < itemsOnPage; i++) {
    const currentIndex = startIndex + i;
    if (currentIndex >= items.length) {
      break;
    }
    const columnNumber = Math.floor(i / rowCount);
    columns[columnNumber].push(items[currentIndex]);
  }
  return columns;
}

export function extractRows(
  tiles: TileItem[],
  pattern: (0 | 1)[]
): null | [string, string, string, string] {
  const matches = tiles
    .filter((tile, index) => {
      return pattern[index] && tile.active;
    })
    .map((tile) => tile.text);
  if (matches.length !== 4) {
    return null;
  }
  return matches as [string, string, string, string];
}

type MatchesResponse =
  | { type: 'null' }
  | { type: 'blackout'; matches: string[][] }
  | {
      type: 'rows';
      matches: string[][];
    };

export function getAllMatches(tiles: TileItem[]): MatchesResponse {
  if (!tiles.find((tile) => !tile.active)) {
    const tilesStrings = tiles.map((tile) => tile.text);
    return {
      type: 'blackout',
      matches: [
        tilesStrings.slice(0, 4),
        tilesStrings.slice(4, 8),
        tilesStrings.slice(8, 12),
        tilesStrings.slice(12, 16),
      ],
    };
  }

  const matches = [Row1, Row2, Row3, Row4, Col1, Col2, Col3, Col4, Diagonal1, Diagonal2]
    .map((pattern) => extractRows(tiles, pattern))
    .filter(Boolean) as string[][];
  if (!matches.length) {
    return { type: 'null' };
  }

  return {
    type: 'rows',
    matches,
  };
}
