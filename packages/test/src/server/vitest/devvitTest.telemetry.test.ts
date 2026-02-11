import { telemetry } from '@devvit/analytics/server/reddit';
import { expect } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

test('telemetry records sessions through the plugin client', async ({ mocks }) => {
  const journeyId = await telemetry.startJourney();
  expect(journeyId.length).toBeGreaterThan(0);

  await telemetry.journeyProgress({
    journeyId,
    progress: 0.25,
  });
  await telemetry.journeyInteraction({
    journeyId,
    action: 'click',
    actionDetails: 'start-button',
  });
  await telemetry.endJourney({
    journeyId,
    complete: true,
    game: { win: true, score: 99 },
  });

  const storedJourney = mocks.telemetry.getJourney(journeyId);
  expect(storedJourney?.progressEvents).toStrictEqual([
    {
      journeyId,
      progress: 0.25,
    },
  ]);
  expect(storedJourney?.interactionEvents).toStrictEqual([
    {
      journeyId,
      action: 'click',
      actionDetails: 'start-button',
    },
  ]);
  expect(storedJourney?.endRequest).toStrictEqual({
    journeyId,
    complete: true,
    game: { win: true, score: 99 },
  });
});
