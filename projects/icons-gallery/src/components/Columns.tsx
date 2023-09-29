import { Devvit } from '@devvit/public-api';

interface ColumnsProps {
  count: number;
  children: JSX.Children;
}

export const Columns = ({ count, children }: ColumnsProps): JSX.Element => {
  const rows: JSX.Element[] = [];

  // Divide the children into rows with N (count) children each.
  // Pad the last row if incomplete.
  const width = 100 / count;
  for (let i = 0; i < children.length; i += count) {
    const row = children.slice(i, i + count).map((c) => (
      <vstack width={width}>
        <hstack grow>{c}</hstack>
      </vstack>
    ));
    const rowHasRoom = (): boolean => row.length < count;
    while (rowHasRoom()) row.push(<hstack width={width} />);
    rows.push(<hstack gap="small">{row}</hstack>);
  }

  return <vstack gap="small">{rows}</vstack>;
};
