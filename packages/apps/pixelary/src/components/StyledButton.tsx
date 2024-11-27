import { Devvit } from '@devvit/public-api';

import Settings from '../settings.json';
import type { SupportedGlyphs } from './PixelSymbol.js';
import { PixelSymbol } from './PixelSymbol.js';
import { PixelText } from './PixelText.js';
import { Shadow } from './Shadow.js';

const disabledStyles = {
  primary: {
    backgroundColor: Settings.theme.tertiary,
    borderColor: Settings.theme.tertiary,
    color: Settings.theme.background,
  },
  secondary: {
    backgroundColor: Settings.theme.background,
    borderColor: Settings.theme.tertiary,
    color: Settings.theme.tertiary,
  },
};

const styles = {
  primary: {
    backgroundColor: Settings.theme.primary,
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
  onPress?: () => void | Promise<void>;
  leadingIcon?: SupportedGlyphs;
  label?: string;
  trailingIcon?: SupportedGlyphs;
  appearance?: 'primary' | 'secondary';
  width?: Devvit.Blocks.SizeString;
  height?: Devvit.Blocks.SizeString;
}

export const StyledButton = (props: StyledButtonProps): JSX.Element => {
  const {
    onPress,
    leadingIcon,
    label,
    trailingIcon,
    appearance,
    width = '100px',
    height = '40px',
  } = props;

  const refererenceStyle = onPress === undefined ? disabledStyles : styles;
  const style = refererenceStyle[appearance || 'primary'];
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
          {leadingIcon ? <PixelSymbol scale={2} type={leadingIcon} color={style.color} /> : null}
          {label ? <PixelText color={style.color}>{label}</PixelText> : null}
          {trailingIcon ? <PixelSymbol scale={2} type={trailingIcon} color={style.color} /> : null}
        </hstack>
      </hstack>
    </Shadow>
  );
};
