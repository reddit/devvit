import type { Context } from '@devvit/public-api';
import { Devvit, useAsync } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import Settings from '../settings.json';
import { PaginatedDrawings } from './PaginatedDrawings.js';
import { PixelText } from './PixelText.js';
import { StyledButton } from './StyledButton.js';

interface MyDrawingsPageProps {
  username: string | null;
  onClose: () => void;
  onDraw: () => void;
}

export const MyDrawingsPage = (props: MyDrawingsPageProps, context: Context): JSX.Element => {
  const loadingState = (
    <vstack grow alignment="center middle">
      <PixelText color={Settings.theme.secondary}>Loading ...</PixelText>
    </vstack>
  );

  if (!props.username) {
    return loadingState;
  }

  const service = new Service(context);
  const tileSize = 88;
  const { data, loading } = useAsync<
    {
      postId: string;
      data: number[];
    }[]
  >(async () => {
    if (!props.username) return [];
    const postIds = await service.getUserDrawings(props.username);
    return await service.getDrawingPosts(postIds);
  });

  const minWidth = 128;
  const width = Math.max(minWidth, context.dimensions?.width || 0);
  const drawingsPerRow = width ? Math.floor((width - 48) / (tileSize + 12)) : 3;

  const emptyState = (
    <vstack grow alignment="center middle">
      <PixelText scale={3}>Draw words</PixelText>
      <spacer height="4px" />
      <PixelText scale={3}>for others</PixelText>
      <spacer height="16px" />
      <PixelText color={Settings.theme.secondary}>Earn points if they</PixelText>
      <spacer height="4px" />
      <PixelText color={Settings.theme.secondary}>guess correctly!</PixelText>
      <spacer height="48px" />
      <StyledButton label="DRAW WORD" onPress={() => props.onDraw()} width="176px" />
    </vstack>
  );

  return (
    <vstack width="100%" height="100%">
      <spacer height="24px" />

      {/* Header */}
      <hstack width="100%" alignment="middle">
        <spacer width="24px" />
        <PixelText scale={2.5} color={Settings.theme.primary}>
          My drawings
        </PixelText>
        <spacer grow />
        <StyledButton
          appearance="primary"
          label="x"
          width="32px"
          height="32px"
          onPress={props.onClose}
        />
        <spacer width="20px" />
      </hstack>

      {/* Loading state */}
      {loading && loadingState}

      {/* Empty state */}
      {(data?.length === 0 || data === undefined) && emptyState}

      {/* Drawing tiles */}
      {data && !loading && (
        <PaginatedDrawings
          drawings={data}
          drawingsPerRow={drawingsPerRow}
          tileSize={tileSize}
          ctaButtonEl={
            <StyledButton
              leadingIcon="+"
              label="DRAW"
              onPress={() => props.onDraw()}
              width="128px"
              height="32px"
            />
          }
        />
      )}
    </vstack>
  );
};
