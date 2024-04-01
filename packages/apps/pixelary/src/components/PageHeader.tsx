import { Devvit } from '@devvit/public-api';
import { StyledButton } from './StyledButton.js';
import { PixelText } from './PixelText.js';

interface PageHeaderProps {
  onClose: () => void;
  title: string;
  description?: string;
}

export const PageHeader = (props: PageHeaderProps): JSX.Element => {
  const { onClose, title, description } = props;

  return (
    <hstack width="100%" alignment="middle">
      <vstack alignment="start top" gap="small">
        <PixelText scale={3}>{title}</PixelText>
        {description !== undefined && <PixelText>{description}</PixelText>}
      </vstack>

      <spacer size="medium" grow />
      <StyledButton width="40px" label="X" onPress={onClose} />
    </hstack>
  );
};
