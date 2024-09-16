import { Devvit } from '@devvit/public-api';
import { PixelText } from './PixelText.js';
import type { SupportedGlyphs } from './PixelSymbol.js';
import { PixelSymbol } from './PixelSymbol.js';
import { Shadow } from './Shadow.js';
import Settings from '../settings.json';

const styles = {
  primary: {
    backgroundColor: Settings.theme.secondary,
    borderColor: Settings.theme.primary,
    color: 'white',
  },
  secondary: {
    backgroundColor: Settings.theme.background,
    borderColor: Settings.theme.primary,
    color: Settings.theme.primary,
  },
};

interface StyledButtonProps {
  onPress: () => void | Promise<void>;
  leadingIcon?: SupportedGlyphs;
  label?: string;
  trailingIcon?: SupportedGlyphs;
  appearance?: 'primary' | 'secondary';
  width: Devvit.Blocks.SizeString;
}

export const StyledButton = (props: StyledButtonProps): JSX.Element => {
  const { onPress, leadingIcon, label, trailingIcon, appearance, width } = props;

  const height: Devvit.Blocks.SizeString = '40px';
  const style = styles[appearance || 'primary'];
  return (
    <Shadow height={height} width={width}>
      <hstack
        height={height}
        width={width}
        onPress={onPress}
        backgroundColor={style.borderColor}
        padding="xsmall"
      >
        <hstack
          height="100%"
          width="100%"
          gap="small"
          alignment="middle center"
          backgroundColor={style.backgroundColor}
        >
          {leadingIcon ? <PixelSymbol scale={3} type={leadingIcon} color={style.color} /> : null}
          {label ? <PixelText color={style.color}>{label}</PixelText> : null}
          {trailingIcon ? <PixelSymbol scale={3} type={trailingIcon} color={style.color} /> : null}
        </hstack>
      </hstack>
    </Shadow>
  );
};
