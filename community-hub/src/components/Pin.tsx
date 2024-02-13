import { Devvit } from '@devvit/public-api';
import { z } from 'zod';
import { Schema } from '../api/Schema.js';
import { PageProps } from '../types/page.js';

type Pin = z.infer<(typeof Schema)['pin']>;

type CommonPinProps = {
  updatePinPostPin: PageProps['pinPostMethods']['updatePinPostPin'];
};

export const PinButton = ({ pin, navigate }: { pin: Pin; navigate: PageProps['navigate'] }) => {
  return (
    <button
      onPress={() => {
        if (pin.type === 'link') {
          // TODO: navigateTo?
          return;
        }

        navigate('pin_detail', { pinId: pin.id });
      }}
      icon={pin.pinIcon}
      appearance="plain"
    >
      {pin.pinTitle}
    </button>
  );
};

const PagePin = ({ pin }: CommonPinProps & { pin: z.infer<(typeof Schema)['pagePin']> }) => {
  return <hstack>pin detail</hstack>;
};

const EventsPin = ({ pin }: CommonPinProps & { pin: z.infer<(typeof Schema)['eventsPin']> }) => {
  return <hstack>pin detail</hstack>;
};

const FormPin = ({ pin }: CommonPinProps & { pin: z.infer<(typeof Schema)['formPin']> }) => {
  return <hstack>pin detail</hstack>;
};

const FlairPin = ({ pin }: CommonPinProps & { pin: z.infer<(typeof Schema)['flairPin']> }) => {
  return <hstack>pin detail</hstack>;
};

const WikiPin = ({ pin }: CommonPinProps & { pin: z.infer<(typeof Schema)['wikiPin']> }) => {
  return <hstack>pin detail</hstack>;
};

export const Pin = ({
  pin,
  updatePinPostPin,
}: CommonPinProps & {
  pin: Pin;
}) => {
  const { type } = pin;

  switch (type) {
    case 'events':
      return <EventsPin pin={pin} updatePinPostPin={updatePinPostPin} />;
    case 'flair':
      return <FlairPin pin={pin} updatePinPostPin={updatePinPostPin} />;
    case 'form':
      return <FormPin pin={pin} updatePinPostPin={updatePinPostPin} />;
    case 'link':
      throw new Error(`Not implemented!`);
    case 'page':
      return <PagePin pin={pin} updatePinPostPin={updatePinPostPin} />;
    case 'wiki':
      return <WikiPin pin={pin} updatePinPostPin={updatePinPostPin} />;

    default:
      throw new Error(`Unhandled route: ${type satisfies never}`);
  }
};
