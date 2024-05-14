import { Devvit } from '@devvit/public-api';

type ColumnsProps = {
  count: number;
  children: JSX.Children;
};

export const Columns = ({ count, children }: ColumnsProps): JSX.Element => {
  const rows: JSX.Element[] = [];

  const arr = Array.isArray(children) ? children : [children];

  // Divide the children into rows with N (count) children each.
  // Pad the last row if incomplete.
  for (let i = 0; i < arr.length; i += count) {
    const row = arr
      .slice(i, i + count)
      .map((child) => <vstack width={100.0 / count}>{child}</vstack>);
    const rowHasRoom = (): boolean => row.length < count;
    while (rowHasRoom()) row.push(<hstack width={100.0 / count} />);
    rows.push(<hstack gap="small">{row}</hstack>);
  }

  return <vstack gap="small">{rows}</vstack>;
};
