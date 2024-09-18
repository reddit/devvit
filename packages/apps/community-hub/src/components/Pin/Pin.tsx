import { Devvit } from '@devvit/public-api';
import type { z } from 'zod';

import type { Schema } from '../../api/Schema.js';
import type { PageProps } from '../../types/page.js';
import type { CommonPinProps, Pin as PinType } from './common.js';
import { EventsPin } from './EventsPin.js';
import { FlairPin } from './FlairPin.js';
import { WikiPin } from './WikiPin.js';

type PinButtonProps = {
  pin: PinType;
  navigate: PageProps['navigate'];
  context: Devvit.Context;
  currentUserUsername: string;
  /** Needed to workaround this bug/limitation: https://reddit.slack.com/archives/C04J8LTDYT1/p1701708939696049 */
  onClickForm: (pin: z.infer<(typeof Schema)['formPin']>) => void;
};

export const PinButton = ({
  pin,
  navigate,
  context,
  currentUserUsername,
  onClickForm,
}: PinButtonProps): JSX.Element => {
  return (
    <hstack>
      <button
        grow
        size="small"
        onPress={() => {
          if (pin.type === 'link' && pin.url) {
            // TODO: No UI to edit this right now.
            context.ui.navigateTo(pin.url);
            return;
          }

          if (pin.type === 'form') {
            onClickForm(pin);
            return;
          }

          navigate('pin_detail', { pinId: pin.id });
        }}
        icon={pin.pinIcon}
        appearance="secondary"
      >
        {pin.pinTitle}
      </button>
    </hstack>
  );
};

const PagePin = ({
  pin,
}: CommonPinProps & { pin: z.infer<(typeof Schema)['pagePin']> }): JSX.Element => {
  return <hstack>pin detail</hstack>;
};

const FormPin = ({
  pin,
}: CommonPinProps & { pin: z.infer<(typeof Schema)['formPin']> }): JSX.Element => {
  return <hstack>pin detail</hstack>;
};

export const Pin = ({
  pin,
  ...rest
}: CommonPinProps & {
  pin: PinType;
}): JSX.Element => {
  const { type } = pin;

  switch (type) {
    case 'events':
      return <EventsPin pin={pin} {...rest} />;
    case 'flair':
      return <FlairPin pin={pin} {...rest} />;
    case 'form':
      return <FormPin pin={pin} {...rest} />;
    case 'link':
      throw new Error(`Not implemented!`);
    case 'page':
      return <PagePin pin={pin} {...rest} />;
    case 'wiki':
      return <WikiPin pin={pin} {...rest} />;

    default:
      throw new Error(`Unhandled route: ${type satisfies never}`);
  }
};
