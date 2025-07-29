import { Devvit } from '@devvit/public-api';

export function createPreview(): JSX.Element {
  return (
    <zstack width="100%" height="100%" alignment="center middle">
      <image
        imageHeight={1024}
        imageWidth={1500}
        height="100%"
        width="100%"
        url="background.png"
        description="Striped blue background"
        resizeMode="cover"
      />
    </zstack>
  );
}
