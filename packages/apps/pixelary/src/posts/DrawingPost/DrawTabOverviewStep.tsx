import type { Context } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

import { PaginatedDrawings } from '../../components/PaginatedDrawings.js';
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

  const { myDrawings, myDrawingsLoading } = props;

  const minWidth = 128;
  const width = Math.max(minWidth, context.dimensions?.width || 0);
  const drawingsPerRow = width ? Math.floor((width - 48) / (tileSize + 12)) : 3;

  // Loading state
  if (myDrawingsLoading) {
    return (
      <vstack grow alignment="center middle">
        <PixelText color={Settings.theme.secondary}>Loading ...</PixelText>
      </vstack>
    );
  }

  // Empty state
  if (myDrawings?.length === 0 || myDrawings === undefined) {
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

  return (
    <PaginatedDrawings
      drawings={myDrawings}
      drawingsPerRow={drawingsPerRow}
      tileSize={tileSize}
      ctaButtonEl={<StyledButton label="DRAW WORD" onPress={() => props.onNext()} width="176px" />}
    ></PaginatedDrawings>
  );
};
