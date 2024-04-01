import { Devvit } from '@devvit/public-api';
import { chunk, isEven } from '../util.js';
import { Schema } from '../api/Schema.js';
import { z } from 'zod';

export const PinToggler = ({
  pins,
  onPinPress,
}: {
  pins: z.infer<(typeof Schema)['pin']>[];
  onPinPress: (pins: z.infer<(typeof Schema)['pin']>) => void;
}) => {
  const isPinEnabled = (pinId: string) => {
    return pins.some((x) => x.id === pinId && x.enabled);
  };

  return (
    <hstack alignment="center">
      {chunk(pins, Math.ceil(pins.length / 2)).map((chunk, index) => {
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
