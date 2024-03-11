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
