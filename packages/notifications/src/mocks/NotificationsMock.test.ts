import { type Metadata } from '@devvit/protos';
import {
  type Notifications,
  NotificationsDefinition,
} from '@devvit/protos/types/devvit/plugin/notifications/notifications_svc.js';
import { Header } from '@devvit/shared-types/Header.js';
import { makeConfig } from '@devvit/shared-types/test/index.js';
import { describe, expect, it } from 'vitest';

import { NotificationsMock } from './NotificationsMock.js';

describe('NotificationsMock', () => {
  const userId = 't2_user';
  const metadata: Metadata = { [Header.User]: { values: [userId] } };

  it('should initialize with empty state', async () => {
    const mock = new NotificationsMock();
    expect(mock.getOptedInUsers().length).toBe(0);
    expect(mock.getSentNotifications().length).toBe(0);
  });

  it('should opt in user', async () => {
    const mock = new NotificationsMock();
    await mock.plugin.OptInCurrentUser({}, metadata);
    expect(mock.getOptedInUsers().includes(userId)).toBe(true);

    const isOptedIn = await mock.plugin.IsOptedIn({ userId }, metadata);
    expect(isOptedIn.optedIn).toBe(true);
  });

  it('should opt out user', async () => {
    const mock = new NotificationsMock();
    await mock.plugin.OptInCurrentUser({}, metadata);
    await mock.plugin.OptOutCurrentUser({}, metadata);
    expect(mock.getOptedInUsers().includes(userId)).toBe(false);
  });

  it('should list opted in users', async () => {
    const mock = new NotificationsMock();
    const users = ['t2_u1', 't2_u2', 't2_u3'];
    for (const u of users) {
      await mock.plugin.OptInCurrentUser(
        {},
        {
          [Header.User]: { values: [u] },
        }
      );
    }

    const list = await mock.plugin.ListOptedInUsers({ limit: 2 });
    expect(list.userIds).toHaveLength(2);
    expect(list.next).toBeDefined();

    const list2 = await mock.plugin.ListOptedInUsers({ limit: 2, after: list.next });
    expect(list2.userIds).toHaveLength(1);
    expect(list2.next).toBeUndefined();
  });

  it('should enqueue notifications', async () => {
    const mock = new NotificationsMock();
    await mock.plugin.OptInCurrentUser({}, metadata);
    const req = {
      title: 'test',
      body: 'body',
      recipients: [{ userId: userId, post: 't3_post', data: {} }],
    };
    const res = await mock.plugin.Enqueue(req);
    expect(res.successCount).toBe(1);
    expect(mock.getSentNotifications()).toHaveLength(1);
    expect(mock.getSentNotifications()[0]).toStrictEqual(req);
  });

  it('should not enqueue notifications for users who are not opted in', async () => {
    const mock = new NotificationsMock();
    const req = {
      title: 'test',
      body: 'body',
      recipients: [{ userId: userId, post: 't3_post', data: {} }],
    };
    const res = await mock.plugin.Enqueue(req);

    expect(res.successCount).toBe(0);
    expect(res.failureCount).toBe(1);
    expect(res.errors).toHaveLength(1);
    expect(res.errors?.[0]).toMatchObject({
      userId,
      message: 'user has not opted in to receive push notifications',
    });
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it('should reject enqueue when recipients list is empty', async () => {
    const mock = new NotificationsMock();
    await expect(
      mock.plugin.Enqueue({
        title: 'test',
        body: 'body',
        recipients: [],
      })
    ).rejects.toThrow('recipients list cannot be empty');
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it('should reject enqueue when title is empty', async () => {
    const mock = new NotificationsMock();
    await expect(
      mock.plugin.Enqueue({
        title: '',
        body: 'body',
        recipients: [{ userId, post: 't3_post', data: {} }],
      })
    ).rejects.toThrow('title is required');
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it('should reject enqueue when body is empty', async () => {
    const mock = new NotificationsMock();
    await expect(
      mock.plugin.Enqueue({
        title: 'test',
        body: '',
        recipients: [{ userId, post: 't3_post', data: {} }],
      })
    ).rejects.toThrow('body is required');
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it('should reject enqueue when title exceeds max length', async () => {
    const mock = new NotificationsMock();
    await expect(
      mock.plugin.Enqueue({
        title: 'x'.repeat(61),
        body: 'body',
        recipients: [{ userId, post: 't3_post', data: {} }],
      })
    ).rejects.toThrow('title exceeds maximum length of 60 characters');
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it('should reject enqueue when body exceeds max length', async () => {
    const mock = new NotificationsMock();
    await expect(
      mock.plugin.Enqueue({
        title: 'test',
        body: 'x'.repeat(101),
        recipients: [{ userId, post: 't3_post', data: {} }],
      })
    ).rejects.toThrow('body exceeds maximum length of 100 characters');
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it('should return an error when recipient userId is missing', async () => {
    const mock = new NotificationsMock();
    const res = await mock.plugin.Enqueue({
      title: 'test',
      body: 'body',
      recipients: [{ userId: '', post: 't3_post', data: {} }],
    });

    expect(res.successCount).toBe(0);
    expect(res.failureCount).toBe(1);
    expect(res.errors?.[0]).toStrictEqual({
      userId: '',
      message: 'recipient_id is required',
    });
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it('should return an error when recipient thing is missing', async () => {
    const mock = new NotificationsMock();
    await mock.plugin.OptInCurrentUser({}, metadata);
    const res = await mock.plugin.Enqueue({
      title: 'test',
      body: 'body',
      recipients: [{ userId, data: {} }],
    });

    expect(res.successCount).toBe(0);
    expect(res.failureCount).toBe(1);
    expect(res.errors?.[0]).toMatchObject({
      userId,
      message: 'thing must be provided for recipient',
    });
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it("should return an error when recipient comment doesn't start with t1_", async () => {
    const mock = new NotificationsMock();
    await mock.plugin.OptInCurrentUser({}, metadata);
    const res = await mock.plugin.Enqueue({
      title: 'test',
      body: 'body',
      recipients: [{ userId, comment: 'nope', data: {} }],
    });

    expect(res.successCount).toBe(0);
    expect(res.failureCount).toBe(1);
    expect(res.errors?.[0]).toMatchObject({
      userId,
      message: "comment must be provided and start with 't1_'",
    });
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it("should return an error when recipient post doesn't start with t3_", async () => {
    const mock = new NotificationsMock();
    await mock.plugin.OptInCurrentUser({}, metadata);
    const res = await mock.plugin.Enqueue({
      title: 'test',
      body: 'body',
      recipients: [{ userId, post: 'nope', data: {} }],
    });

    expect(res.successCount).toBe(0);
    expect(res.failureCount).toBe(1);
    expect(res.errors?.[0]).toMatchObject({
      userId,
      message: "post must be provided and start with 't3_'",
    });
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it('should return an error when recipient has both comment and post set', async () => {
    const mock = new NotificationsMock();
    await mock.plugin.OptInCurrentUser({}, metadata);
    const res = await mock.plugin.Enqueue({
      title: 'test',
      body: 'body',
      recipients: [{ userId, comment: 't1_comment', post: 't3_post', data: {} }],
    });

    expect(res.successCount).toBe(0);
    expect(res.failureCount).toBe(1);
    expect(res.errors?.[0]).toMatchObject({
      userId,
      message: 'either comment or post must be provided',
    });
    expect(mock.getSentNotifications()).toHaveLength(0);
  });

  it('should handle badges', async () => {
    const mock = new NotificationsMock();
    await mock.plugin.ShowGamesDrawerBadge({ post: 't3_post' });
    expect(mock.getActiveBadge()?.post).toBe('t3_post');

    const status = await mock.plugin.GetGamesDrawerBadgeStatus({});
    expect(status.hasActiveBadge).toBe(true);

    await mock.plugin.DismissGamesDrawerBadge({});
    expect(mock.getActiveBadge()).toBeUndefined();

    const status2 = await mock.plugin.GetGamesDrawerBadgeStatus({});
    expect(status2.hasActiveBadge).toBe(false);
  });

  it('should opt in by userId', async () => {
    const mock = new NotificationsMock();
    mock.optInUser('t2_some_user');
    expect(mock.getOptedInUsers()).toStrictEqual(['t2_some_user']);
  });

  it('should opt out by userId', async () => {
    const mock = new NotificationsMock();
    mock.optInUser('t2_some_user');
    mock.optOutUser('t2_some_user');
    expect(mock.getOptedInUsers()).toStrictEqual([]);
  });

  it('should wire through makeConfig', async () => {
    const mock = new NotificationsMock();
    const config = makeConfig({
      plugins: {
        [NotificationsDefinition.fullName]: mock.plugin,
      },
    });
    const notifications = config.use(NotificationsDefinition) as Notifications;

    expect(notifications).toBeDefined();
    await notifications.OptInCurrentUser({}, metadata);
    expect(mock.getOptedInUsers().includes(userId)).toBe(true);
  });
});
