import { Devvit, useState } from '@devvit/public-api';

import Settings from '../settings.json';
import type { CollectionData } from '../types/PostData.js';
import { Drawings } from './Drawings.js';
import { StyledButton } from './StyledButton.js';

interface PaginatedDrawingsProps {
  drawings:
    | {
        postId: string;
        data: number[];
      }[]
    | CollectionData[]
    | null;
  tileSize: number;
  drawingsPerRow: number;
  ctaButtonEl: JSX.Element;
}

const DEFAULT_TILE_SIZE = 88;

export const PaginatedDrawings: Devvit.BlockComponent<PaginatedDrawingsProps> = ({
  tileSize = DEFAULT_TILE_SIZE,
  drawings,
  drawingsPerRow,
  ctaButtonEl,
}) => {
  if (drawings?.length === 0) {
    return null;
  }

  const rowsPerPage = 3;
  const [paginationOffset, setPaginationOffset] = useState(0);

  // Use context dimensions unless max drawings per row is specified
  const rows = drawings ? Math.ceil(drawings.length / drawingsPerRow) : 0;
  const hasOverflow = paginationOffset + rowsPerPage < rows;

  const gridWidth = drawingsPerRow * (tileSize + 4) + (drawingsPerRow - 1) * 8;
  const cutOffWidth = gridWidth;

  return (
    <vstack grow width="100%" alignment="center">
      <spacer height="24px" />

      <Drawings
        drawings={drawings}
        tileSize={tileSize}
        rowsPerPage={rowsPerPage}
        drawingsPerRow={drawingsPerRow}
        paginationOffset={paginationOffset}
      ></Drawings>

      {hasOverflow && (
        <vstack width={`${cutOffWidth}px`} height="4px" backgroundColor={Settings.theme.tertiary} />
      )}

      <spacer grow />

      {/* Footer */}
      <hstack gap="small" width={`${gridWidth}px`} alignment="center">
        {ctaButtonEl}
        {(hasOverflow || paginationOffset > 0) && <spacer grow />}
        {paginationOffset > 0 && (
          <StyledButton
            leadingIcon="arrow-up"
            appearance="secondary"
            onPress={() => setPaginationOffset((x) => x - rowsPerPage)}
            width="32px"
            height="32px"
          />
        )}
        {hasOverflow && (
          <StyledButton
            leadingIcon="arrow-down"
            appearance="secondary"
            onPress={() => setPaginationOffset((x) => x + rowsPerPage)}
            width="32px"
            height="32px"
          />
        )}
      </hstack>

      <spacer height="20px" />
    </vstack>
  );
};
