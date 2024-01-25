import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import { Shadow } from './Shadow.js';

interface StyledButtonProps {
  onPress: () => void;
  label: string;
  width: Devvit.Blocks.SizeString;
}

export const StyledButton = (props: StyledButtonProps): JSX.Element => {
  const { onPress, label, width } = props;

  const height: Devvit.Blocks.SizeString = '44px';

  return (
    <Shadow height={height} width={width}>
      <hstack
        height={height}
        width={width}
        alignment="middle center"
        backgroundColor="#4F4F4F"
        cornerRadius="small"
        border="thick"
        borderColor="black"
        onPress={onPress}
      >
        <PixelText color="white">{label}</PixelText>
      </hstack>
    </Shadow>
  );
};
