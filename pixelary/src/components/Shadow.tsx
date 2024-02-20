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
      <vstack>
        <spacer size="xsmall" />
        <hstack>
          <spacer size="xsmall" />
          <hstack
            height={height}
            width={width}
            cornerRadius="small"
            backgroundColor="rgba(0,0,0,0.2)"
          />
        </hstack>
      </vstack>

      {/* Card */}
      {children}
    </zstack>
  );
};
