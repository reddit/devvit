import { Devvit } from '@devvit/public-api';

export const ImageResizePreview = ({
  mode,
  stackHeight,
  stackWidth,
  imageBlockHeight,
  imageBlockWidth,
  grow,
  reverse,
}: {
  mode: Devvit.Blocks.ImageResizeMode;
  stackHeight?: number;
  stackWidth?: number;
  imageBlockHeight: number;
  imageBlockWidth: number;
  grow: boolean;
  reverse: boolean;
}): JSX.Element => {
  const image: JSX.Element = (
    <image
      height={`${imageBlockHeight}px`}
      width={`${imageBlockWidth}px`}
      url="Snoo.png"
      resizeMode={mode}
      imageHeight={192}
      imageWidth={192}
      grow={grow}
    />
  );
  return (
    <hstack
      alignment="center middle"
      width={'100%'}
      grow
      border="thick"
      borderColor="neutral-border-weak"
      padding={'small'}
    >
      {stackHeight && stackWidth ? (
        <vstack
          height={`${stackHeight}px`}
          width={`${stackWidth}px`}
          reverse={reverse}
          backgroundColor="#EAEDEF"
          border={'thin'}
          borderColor={'green'}
        >
          {image}
        </vstack>
      ) : (
        <vstack reverse={reverse} backgroundColor="#EAEDEF" border={'thin'} borderColor={'green'}>
          {image}
        </vstack>
      )}
    </hstack>
  );
};
