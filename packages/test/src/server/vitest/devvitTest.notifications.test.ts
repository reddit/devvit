import { notifications } from '@devvit/notifications';
import { context } from '@devvit/server';
import { T2, T3 } from '@devvit/shared-types/tid.js';
import { expect } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

test('notifications work for end users', async ({ mocks }) => {
  const currentUser = context.userId!;
  await notifications.optInCurrentUser();

  const isOptedIn = await notifications.isOptedIn(currentUser);
  expect(isOptedIn).toBe(true);
  expect(mocks.notifications.getOptedInUsers().includes(currentUser)).toBe(true);

  const notification = {
    title: 'Hello',
    body: 'World',
    recipients: [{ userId: currentUser, link: 't3_post' as T3, data: {} }],
  };
  const response = await notifications.enqueue(notification);
  expect(response.successCount).toBe(1);

  const sentNotifications = mocks.notifications.getSentNotifications();

  expect(sentNotifications).toHaveLength(1);
  expect(sentNotifications[0]).toMatchObject({
    title: 'Hello',
    body: 'World',
    recipients: [
      {
        userId: currentUser,
        post: 't3_post',
        data: {},
      },
    ],
  });

  await notifications.optOutCurrentUser();
  const isOptedInAfter = await notifications.isOptedIn(currentUser);
  expect(isOptedInAfter).toBe(false);
  expect(mocks.notifications.getOptedInUsers().includes(currentUser)).toBe(false);
});

const userContextTest = createDevvitTest({
  userId: 't2_custom_user',
});

userContextTest('notifications use current user from context', async ({ mocks }) => {
  await notifications.optInCurrentUser();
  const isOptedIn = await notifications.isOptedIn('t2_custom_user' as T2);
  expect(isOptedIn).toBe(true);
  expect(mocks.notifications.getOptedInUsers().includes('t2_custom_user')).toBe(true);
});
