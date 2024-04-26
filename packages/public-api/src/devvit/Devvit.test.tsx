/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { Devvit } from './Devvit.js';

const Box: Devvit.BlockComponent = ({ children }) => {
  return (
    <hstack>
      <button onPress={() => console.log('hi')}>hi</button>
      {children ?? null}
    </hstack>
  );
};
const Boxed: Devvit.BlockComponent = () => {
  return (
    <Box>
      <vstack>
        <text>hi world!</text>
      </vstack>
    </Box>
  );
};

describe('components type system', () => {
  test('should not bork out', async () => {
    <Boxed />;
  });
});
