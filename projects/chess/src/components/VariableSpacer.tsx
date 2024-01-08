import { Devvit } from '@devvit/public-api';

type VariableSpacerProps = {
  count?: number;
  size?: Devvit.Blocks.SpacerSize;
};

export const VariableSpacer = ({ count = 3, size = 'large' }: VariableSpacerProps) => {
  const spacers = new Array(count).fill(<spacer size={size} />);
  return (
    <vstack>
      <hstack>{spacers}</hstack>
      {spacers}
    </vstack>
  );
};
