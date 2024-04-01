import { Devvit } from '@devvit/public-api';

interface ShadowProps {
  height: Devvit.Blocks.SizeString;
  width: Devvit.Blocks.SizeString;
  children: JSX.Element;
  onPress?: () => void;
}

export const Shadow = (props: ShadowProps): JSX.Element => {
  const { height, width, children, onPress } = props;

  return (
    <zstack alignment="start top" onPress={onPress}>
      {/* Shadow */}
      <vstack width="100%" height="100%">
        <spacer size="xsmall" />
        <hstack width="100%" height="100%">
          <spacer size="xsmall" />
          <hstack height={height} width={width} backgroundColor="rgba(0,0,0,0.2)" />
        </hstack>
      </vstack>

      {/* Card */}
      {children}
    </zstack>
  );
};
