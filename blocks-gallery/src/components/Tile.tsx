import { Devvit } from '@devvit/public-api';

export type TileProps = {
  label?: string | undefined;
  padding?: Devvit.Blocks.ContainerPadding | undefined;
  children: JSX.Element | JSX.Element[];
};

export const Tile = (props: TileProps): JSX.Element => {
  const { label, children } = props;
  return (
    <vstack
      padding={props.padding ?? 'medium'}
      border="thick"
      borderColor="neutral-border-weak"
      cornerRadius="small"
      gap="small"
      grow
    >
      <hstack alignment="start middle" grow>
        {children}
      </hstack>
      {label ? (
        <text selectable={false} color="neutral-content-weak">
          {label}
        </text>
      ) : (
        <></>
      )}
    </vstack>
  );
};
