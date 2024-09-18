import { Devvit } from '@devvit/public-api';
import type { z } from 'zod';

import type { Schema } from '../api/Schema.js';
import { chunk } from '../util.js';

export const PinToggler = ({
  pins,
  onPinPress,
}: {
  pins: z.infer<(typeof Schema)['pin']>[];
  onPinPress: (pins: z.infer<(typeof Schema)['pin']>) => void;
}): JSX.Element => {
  const isPinEnabled = (pinId: string): boolean => {
    return pins.some((x) => x.id === pinId && x.enabled);
  };

  return (
    <hstack alignment="center">
      {chunk(pins, Math.ceil(pins.length / 2)).map((chunk) => {
        return (
          <vstack alignment="top start">
            {chunk.map((pin) => {
              return (
                <button
                  size="small"
                  onPress={() => onPinPress(pin)}
                  icon={isPinEnabled(pin.id) ? 'checkbox-fill' : 'checkbox'}
                  appearance="plain"
                >
                  {pin.pinTitle}
                </button>
              );
            })}
          </vstack>
        );
      })}
    </hstack>
  );
};
