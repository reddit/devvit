/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import { makeHandler } from './ui-request-handler.js';
import { Devvit } from '../Devvit.js';
import { mockMetadata } from './blocks/handler/test-helpers.js';

it('makeHandler - returns a UIResponse from a valid component and request', async () => {
  const handler = makeHandler(() => (
    <blocks>
      <text>foo</text>
    </blocks>
  ));

  await expect(
    handler({ events: [] }, mockMetadata).then((x) => JSON.stringify(x))
  ).resolves.toContain('foo');
});
