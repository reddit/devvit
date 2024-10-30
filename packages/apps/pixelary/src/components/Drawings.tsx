import { Devvit } from '@devvit/public-api';

import type { CollectionData } from '../types/PostData.js';
import { Drawing } from './Drawing.js';

interface PaginatedDrawingsProps {
  drawings:
    | {
        postId: string;
        data: number[];
      }[]
    | CollectionData[]
    | null;
  tileSize: number;
  rowsPerPage: number;
  drawingsPerRow: number;
  paginationOffset: number;
}

export const Drawings: Devvit.BlockComponent<PaginatedDrawingsProps> = (
  { tileSize, drawings, rowsPerPage, drawingsPerRow, paginationOffset },
  context
) => {
  if (drawings?.length === 0) {
    return null;
  }

  const drawingsByPage = (drawings ?? [])
    .slice(paginationOffset * drawingsPerRow, (paginationOffset + rowsPerPage + 1) * drawingsPerRow)
    .map((drawing) => (
      <Drawing
        size={tileSize}
        data={drawing.data}
        onPress={async () =>
          context.reddit.getPostById(drawing.postId).then((post) => {
            if (!post) {
              context.ui.showToast('Post not found');
              return;
            }
            return context.ui.navigateTo(post);
          })
        }
      />
    ));

  const drawingRows = [];
  for (let i = 0; i < drawingsByPage.length; i += drawingsPerRow) {
    const elements = drawingsByPage.slice(i, i + drawingsPerRow);
    drawingRows.push(<hstack gap="small">{elements}</hstack>);
  }

  return (
    <vstack grow gap="small">
      {drawingRows.slice(paginationOffset, paginationOffset + rowsPerPage + 1)}
    </vstack>
  );
};
