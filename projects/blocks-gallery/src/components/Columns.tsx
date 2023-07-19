import { Devvit } from '@devvit/public-api';

interface ColumnsProps {
  count: number;
  children: JSX.Children;
}

export const Columns = ({ count, children }: ColumnsProps) => {
  const rows: JSX.Element[] = [];

  // Divide the children into rows with N (count) children each.
  // Pad the last row if incomplete.
  for (let i = 0; i < children.length; i += count) {
    const row = children.slice(i, i + count);
    const rowHasRoom = () => row.length < count;
    while (rowHasRoom()) row.push(<hstack grow />);
    rows.push(<hstack gap="small">{row}</hstack>);
  }

  return <vstack gap="small">{rows}</vstack>;
};
