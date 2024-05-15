import type { Devvit, Post } from '@devvit/public-api';
import { LoadingState } from './components/Loading.js';
import { AppSetting, getAppSettingValue } from './AppSettings.js';
import {
  createDatetime,
  getFormattedDateString,
  getShortFormattedDateString,
  paddedDateComponent,
} from './utils/Time.js';
import { initializePoll } from './plugins/poll/Poll.js';
import { initializeTrivia } from './plugins/trivia/Trivia.js';
import { initializeTopic } from './plugins/topic/Topic.js';

export const ScheduledPostJobName = 'scheduled_post_job';
const ActiveThreadKey = 'currentPost';
const AllThreadsKey = 'posts';

export type ThreadInfo = {
  id: string;
  title: string;
  date: string;
  timezone: string;
  header?: string;
  rules?: string;
  previousPostId?: string;
};

export async function getActiveThreadInfo(
  context: Devvit.Context
): Promise<ThreadInfo | undefined> {
  const { redis } = context;
  const infoString = await redis.get(ActiveThreadKey);
  if (!infoString) return undefined;
  return JSON.parse(infoString);
}

export async function getThreadInfoById(
  postId: string | undefined,
  context: Devvit.Context
): Promise<ThreadInfo | undefined> {
  const { redis } = context;
  if (!postId) return undefined;
  const infoString = await redis.hget(AllThreadsKey, postId);
  if (!infoString) return undefined;
  return JSON.parse(infoString);
}

async function getActiveThreadPost(context: Devvit.Context): Promise<Post | undefined> {
  const { reddit } = context;
  const activePostInfo = await getActiveThreadInfo(context);
  if (!activePostInfo) return undefined;
  return await reddit.getPostById(activePostInfo.id);
}

export async function storeNewThread(info: ThreadInfo, context: Devvit.Context): Promise<void> {
  const { redis } = context;
  await redis.set(ActiveThreadKey, JSON.stringify(info));
  await redis.hset(AllThreadsKey, { [info.id]: JSON.stringify(info) });
  await initializePlugins(info.id, context);
}

async function initializePlugins(postId: string, context: Devvit.Context): Promise<void> {
  await Promise.all([
    initializePoll(postId, context),
    initializeTrivia(postId, context),
    initializeTopic(postId, context),
  ]);
}

export async function createNewThreadPost(context: Devvit.Context): Promise<{ success: boolean }> {
  const { reddit } = context;
  const subreddit = await reddit.getCurrentSubreddit();

  const dateString = new Date().toISOString();
  const timezone: string = await getAppSettingValue(AppSetting.Timezone, context);
  const zonedDateString = getShortFormattedDateString(dateString, timezone);
  const title = await getAppSettingValue(AppSetting.ThreadTitle, context);
  const header = await getAppSettingValue(AppSetting.HeaderTitle, context);
  const rules = await getAppSettingValue(AppSetting.Rules, context);

  const post = await reddit.submitPost({
    title: `${title} - ${zonedDateString}`,
    subredditName: subreddit.name,
    preview: LoadingState(`Loading ${title}\n${zonedDateString}`),
  });
  if (!post) return { success: false };
  const activeThreadPost = await getActiveThreadPost(context);
  await storeNewThread(
    {
      id: post.id,
      title: title,
      date: dateString,
      timezone: timezone,
      header,
      rules,
      previousPostId: activeThreadPost?.id,
    },
    context
  );
  if (activeThreadPost) {
    try {
      await activeThreadPost.unsticky();
    } catch (e) {
      console.log(
        `Failed to unsticky current post: ${activeThreadPost.id} - ${activeThreadPost.title}`
      );
    }
  }
  try {
    await post.sticky();
  } catch (e) {
    console.log(`Failed to sticky new post: ${post.id} - ${post.title}`);
  }
  console.log(`${zonedDateString}: New daily thread created: ${post.id} - ${post.title}`);
  return { success: true };
}

export async function resetScheduledPosts(context: Devvit.Context): Promise<void> {
  const { scheduler } = context;
  const allJobs = await scheduler.listJobs();
  const filteredJobs = allJobs.filter((job) => {
    return job.name === ScheduledPostJobName;
  });
  await Promise.all(filteredJobs.map((job) => scheduler.cancelJob(job.id)));
  await scheduleNextPost(context);
}

export async function scheduleNextPost(context: Devvit.Context): Promise<void> {
  const { scheduler } = context;
  const hourSetting = await getAppSettingValue(AppSetting.HourOfDayToPost, context);

  const timezone = await getAppSettingValue(AppSetting.Timezone, context);
  const now = new Date();
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const scheduledDate = createDatetime(
    // We add 1 to the month because months are 0-indexed
    // We add 1 to the day to ensure the post is scheduled for the next day
    `${tzDate.getFullYear()}-${paddedDateComponent(tzDate.getMonth() + 1)}-${tzDate.getDate() + 1}`,
    hourSetting,
    timezone
  );

  console.log(`Next post scheduled for ${getFormattedDateString(scheduledDate, timezone)}`);

  try {
    await scheduler.runJob({
      name: ScheduledPostJobName,
      runAt: new Date(scheduledDate),
    });
  } catch (e) {
    console.log('error was not able to schedule:', e);
    throw e;
  }
}
