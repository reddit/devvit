import { Devvit } from '@devvit/public-api';
import { StyledButton } from './StyledButton.js';
import { PixelText } from './PixelText.js';

interface PageHeaderProps {
  onClose: () => void;
  title: string;
}

export const PageHeader = (props: PageHeaderProps): JSX.Element => {
  const { onClose, title } = props;

  return (
    <hstack width="100%" alignment="middle">
      <PixelText scale={3}>{title}</PixelText>
      <spacer size="medium" grow />
      <StyledButton width="44px" label="X" onPress={onClose} />
    </hstack>
  );
};
