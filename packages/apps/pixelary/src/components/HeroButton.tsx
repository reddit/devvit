import { Devvit } from '@devvit/public-api';

import Settings from '../settings.json';
import { PixelText } from './PixelText.js';

interface HeroButtonProps {
  onPress?: () => void | Promise<void>;
  label: string;
  animated?: boolean;
}

export const HeroButton = (props: HeroButtonProps): JSX.Element => {
  return (
    <zstack alignment="center middle" onPress={props.onPress}>
      <image
        imageHeight="64px"
        imageWidth="246px"
        height="64px"
        width="246px"
        url={
          props.animated
            ? 'animated-button.gif'
            : `data:image/svg+xml,
<svg width="246" height="64" viewBox="0 0 246 64" xmlns="http://www.w3.org/2000/svg">
<path d="M242 16H20V20H16V60H20V64H242V60H246V20H242V16Z" fill="${Settings.theme.shadow}"/>
<path d="M234 8H12V12H8V52H12V56H234V52H238V12H234V8Z" fill="${Settings.theme.primary}"/>
</svg>`
        }
      />
      <PixelText color="white">{props.label}</PixelText>
    </zstack>
  );
};
