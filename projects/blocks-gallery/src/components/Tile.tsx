import { Devvit } from '@devvit/public-api';

export interface TileProps {
  label?: string | undefined;
  padding?: Devvit.Blocks.ContainerPadding | undefined;
  children: JSX.Element | JSX.Element[];
}

export const Tile = (props: TileProps): JSX.Element => {
  const { label, children } = props;
  return (
    <vstack
      padding={props.padding ?? 'medium'}
      border="thick"
      borderColor="#0002"
      cornerRadius="small"
      gap="small"
      grow
    >
      <hstack alignment="start middle" grow>
        {children}
      </hstack>
      {label ? (
        <text selectable={false} color="#576F76">
          {label}
        </text>
      ) : (
        <></>
      )}
    </vstack>
  );
};
