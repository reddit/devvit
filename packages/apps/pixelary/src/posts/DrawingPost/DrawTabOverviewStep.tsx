import type { Context } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { PixelText } from '../../components/PixelText.js';
import { StyledButton } from '../../components/StyledButton.js';
import Settings from '../../settings.json';
import type { PostData } from '../../types/PostData.js';

interface DrawTabOverviewStepProps {
  data: {
    username: string | null;
  };
  myDrawings: PostData[] | null;
  myDrawingsLoading: boolean;
  onNext: () => void;
}

export const DrawTabOverviewStep = (
  props: DrawTabOverviewStepProps,
  context: Context
): JSX.Element => {
  const tileSize = 88;
  const rowsPerPage = 3;
  const [paginationOffset, setPaginationOffset] = useState(0);

  const { myDrawings, myDrawingsLoading } = props;

  const minWidth = 128;
  const width = Math.max(minWidth, context.dimensions?.width || 0);
  const drawingsPerRow = width ? Math.floor((width - 48) / (tileSize + 12)) : 3;
  const rows = myDrawings ? Math.ceil(myDrawings.length / drawingsPerRow) : 0;
  const hasOverflow = paginationOffset + rowsPerPage < rows;

  const drawings = (myDrawings ?? [])
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

  // Loading state
  if (myDrawingsLoading) {
    return (
      <vstack grow alignment="center middle">
        <PixelText color={Settings.theme.secondary}>Loading ...</PixelText>
      </vstack>
    );
  }

  // Empty state
  if (drawings?.length === 0 || drawings === undefined) {
    return (
      <vstack grow alignment="center middle">
        <PixelText scale={3}>Draw words</PixelText>
        <spacer height="4px" />
        <PixelText scale={3}>for others</PixelText>
        <spacer height="16px" />
        <PixelText color={Settings.theme.secondary}>Earn points if they</PixelText>
        <spacer height="4px" />
        <PixelText color={Settings.theme.secondary}>guess correctly!</PixelText>
        <spacer height="48px" />
        <StyledButton label="DRAW WORD" onPress={() => props.onNext()} width="176px" />
      </vstack>
    );
  }

  // My drawings
  const drawingRows = [];
  for (let i = 0; i < drawings.length; i += drawingsPerRow) {
    const elements = drawings.slice(i, i + drawingsPerRow);
    drawingRows.push(<hstack gap="small">{elements}</hstack>);
  }

  const gridWidth = drawingsPerRow * (tileSize + 4) + (drawingsPerRow - 1) * 8;
  const cutOffWidth = gridWidth;

  return (
    <vstack grow width="100%" alignment="center">
      <spacer height="24px" />

      {/* Drawings */}
      <vstack height="346px" gap="small">
        {drawingRows.slice(paginationOffset, paginationOffset + rowsPerPage + 1)}
      </vstack>

      {/* Cut off line */}
      {hasOverflow && (
        <vstack width={`${cutOffWidth}px`} height="4px" backgroundColor={Settings.theme.tertiary} />
      )}

      <spacer grow />

      {/* Footer */}
      <hstack gap="small" width={`${gridWidth}px`} alignment="center">
        <StyledButton label="DRAW WORD" onPress={() => props.onNext()} width="176px" />
        {(hasOverflow || paginationOffset > 0) && <spacer grow />}
        {paginationOffset > 0 && (
          <StyledButton
            leadingIcon="arrow-up"
            appearance="secondary"
            onPress={() => setPaginationOffset((x) => x - rowsPerPage)}
            width="40px"
          />
        )}
        {hasOverflow && (
          <StyledButton
            leadingIcon="arrow-down"
            appearance="secondary"
            onPress={() => setPaginationOffset((x) => x + rowsPerPage)}
            width="40px"
          />
        )}
      </hstack>

      <spacer height="20px" />
    </vstack>
  );
};
