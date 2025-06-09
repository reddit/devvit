import { Devvit } from '@devvit/public-api';

import { Calc } from '../calculator.js';
import { Keypad } from './Keypad.js';
import { Output } from './Output.js';

type CalculatorProps = {
  disabled?: boolean;
};

export const Calculator: Devvit.BlockComponent<CalculatorProps> = ({ disabled }, context) => {
  const calc = disabled ? undefined : new Calc(context);
  return (
    <vstack gap="small" padding="medium">
      <Output calc={calc} />
      <Keypad onPress={calc?.onKeyPress} />
    </vstack>
  );
};
