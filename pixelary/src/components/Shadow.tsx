import { Devvit } from '@devvit/public-api';

interface ShadowProps {
  height: Devvit.Blocks.SizeString;
  width: Devvit.Blocks.SizeString;
  children: JSX.Element;
}

export const Shadow = (props: ShadowProps): JSX.Element => {
  const { height, width, children } = props;

  return (
    <zstack alignment="start top">
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
