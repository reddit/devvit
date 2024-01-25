import { Devvit } from '@devvit/public-api';

export const LoadingState = (): JSX.Element => (
  <vstack height="100%" width="100%" alignment="center middle">
    <image
      url="spinner.gif"
      description="Loading ..."
      imageHeight={1080}
      imageWidth={1080}
      width="128px"
      height="128px"
      resizeMode="scale-down"
    />
  </vstack>
);
