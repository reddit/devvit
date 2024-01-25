import { Devvit } from '@devvit/public-api';
import { PixelSymbol, SupportedGlyphs } from './PixelSymbol.js';
import { Shadow } from './Shadow.js';

interface StyledIconButtonProps {
  onPress: () => void;
  icon: SupportedGlyphs;
}

export const StyledIconButton = (props: StyledIconButtonProps): JSX.Element => {
  const { onPress, icon } = props;

  const height: Devvit.Blocks.SizeString = '44px';
  const width: Devvit.Blocks.SizeString = '44px';

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
        <PixelSymbol color="white" type={icon} />
      </hstack>
    </Shadow>
  );
};
