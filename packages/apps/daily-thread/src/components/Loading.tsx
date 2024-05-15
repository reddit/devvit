import { Devvit } from '@devvit/public-api';

export function LoadingState(loadingText: string): JSX.Element {
  return (
    <zstack width={'100%'} height={'100%'} alignment="center middle">
      <vstack width={'100%'} height={'100%'} alignment="center middle">
        <image
          url="loading.gif"
          description="Loading ..."
          height={'140px'}
          width={'140px'}
          imageHeight={'240px'}
          imageWidth={'240px'}
        />
        <spacer size="small" />
        <text maxWidth={`80%`} size="large" weight="bold" alignment="center middle" wrap>
          {loadingText}
        </text>
      </vstack>
    </zstack>
  );
}
