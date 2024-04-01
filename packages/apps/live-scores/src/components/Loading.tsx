import { Devvit } from '@devvit/public-api';

export function LoadingStateFootball(): JSX.Element {
  return (
    <zstack width={'100%'} height={'100%'} alignment="center middle">
      <image
        width={'100%'}
        height={'100%'}
        imageWidth={1136}
        imageHeight={648}
        url="football/background.png"
        resizeMode="cover"
      />
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
        <text size="large" weight="bold" color="#F2F4F5">
          Scoreboard loading...
        </text>
      </vstack>
    </zstack>
  );
}

export function LoadingState(): JSX.Element {
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
        <text size="large" weight="bold">
          Scoreboard loading...
        </text>
      </vstack>
    </zstack>
  );
}
