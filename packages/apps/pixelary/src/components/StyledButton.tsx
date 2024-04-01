import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import { Shadow } from './Shadow.js';

interface StyledButtonProps {
  onPress: () => void | Promise<void>;
  label: string;
  width: Devvit.Blocks.SizeString;
}

export const StyledButton = (props: StyledButtonProps): JSX.Element => {
  const { onPress, label, width } = props;

  const height: Devvit.Blocks.SizeString = '40px';

  return (
    <Shadow height={height} width={width}>
      <hstack
        height={height}
        width={width}
        onPress={onPress}
        backgroundColor="black"
        padding="xsmall"
      >
        <hstack height="100%" width="100%" alignment="middle center" backgroundColor="#444444">
          <PixelText color="white">{label}</PixelText>
        </hstack>
      </hstack>
    </Shadow>
  );
};
