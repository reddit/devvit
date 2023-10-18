import { Devvit, KVStore, Scheduler } from '@devvit/public-api';
import {
  ONE_MINUTE_IN_MS,
  POST_DATA_KEY,
  POST_REMINDERS_KEY,
  POST_SCHEDULED_ACTION_KEY,
  REMIND_USERS_ACTION_ID,
} from './constants.js';

Devvit.addSchedulerJob({
  name: REMIND_USERS_ACTION_ID,
  onRun: async (event, context) => {
    const { postId } = event.data!;

    const post = await context.reddit.getPostById(postId);
    const remindedUserIds = (await context.kvStore.get(POST_REMINDERS_KEY(postId))) as
      | string[]
      | undefined;
    if (!remindedUserIds || !remindedUserIds.length) {
      return;
    }

    for (const userId of remindedUserIds) {
      const user = await context.reddit.getUserById(userId);
      await context.reddit.sendPrivateMessage({
        to: user.username,
        subject: '3..2..1..',
        text: `Almost there! You asked me to remind you about [${post.title}](${post.permalink})`,
      });
    }
  },
});

export async function setPostReminder(
  countdownDatetime: string,
  scheduler: Scheduler,
  postId: string,
  kvStore: KVStore
) {
  const reminderDateTimestamp = new Date(countdownDatetime).getTime() - ONE_MINUTE_IN_MS;
  // not setting any reminders if the event happens soon enough
  if (reminderDateTimestamp <= Date.now()) {
    return;
  }

  const scheduledActionId = await scheduler.runJob({
    name: REMIND_USERS_ACTION_ID,
    data: { postId },
    runAt: new Date(reminderDateTimestamp),
  });
  await kvStore.put(POST_SCHEDULED_ACTION_KEY(postId), scheduledActionId);
}

export const getExistingReminders = async (postId: string, kvStore: KVStore): Promise<string[]> => {
  const postRemindersKey = POST_REMINDERS_KEY(postId);
  return ((await kvStore.get(postRemindersKey)) as string[] | undefined) || [];
};

export const addUserReminder = async (userId: string, postId: string, kvStore: KVStore) => {
  const existingReminders = await getExistingReminders(postId, kvStore);
  // should not happen, but better be safe here
  if (existingReminders.includes(userId)) {
    return;
  }
  const newReminders = [...existingReminders, userId];
  await kvStore.put(POST_REMINDERS_KEY(postId), newReminders);
};

export const removeUserReminder = async (userId: string, postId: string, kvStore: KVStore) => {
  const existingReminders = await getExistingReminders(postId, kvStore);
  // should not happen, but better be safe here
  if (!existingReminders.includes(userId)) {
    return;
  }
  const newReminders = existingReminders.filter((reminderUserId) => reminderUserId !== userId);
  await kvStore.put(POST_REMINDERS_KEY(postId), newReminders);
};

export const removePostAssociatedData = async (
  postId: string,
  kvStore: KVStore,
  scheduler: Scheduler
) => {
  const schedulerJobId = await kvStore.get(POST_SCHEDULED_ACTION_KEY(postId));
  if (schedulerJobId) {
    await scheduler.cancelJob(String(schedulerJobId));
  }
  await kvStore.delete(POST_SCHEDULED_ACTION_KEY(postId));
  await kvStore.delete(POST_REMINDERS_KEY(postId));
  await kvStore.delete(POST_DATA_KEY(postId));
};
