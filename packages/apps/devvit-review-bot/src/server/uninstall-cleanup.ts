import { context as ctx, reddit, settings, type TaskResponse } from '@devvit/web/server';

import type { OnCronUninstallCleanupRsp } from '../shared/api.ts';

const RUN_BUDGET_MS: number = 20_000;
const PAGE_SIZE: number = 100;

// We can't unmod mods that came before but no sense polluting the logs trying.
const EXCLUDED_ACCOUNTS = new Set([
  'devvit-dev-bot',
  'devvit-review-bot',
  'devvit-reviewer',
  'stephenoid',
  'snoosnek',
  'slowcooked99',
]);

/** Removes orphaned posts, old posts, and old moderator relationships. */
export async function onCronUninstallCleanup(): Promise<TaskResponse & OnCronUninstallCleanupRsp> {
  const now = Date.now();
  const deadline = now + RUN_BUDGET_MS;
  const maxAgeMs = (await settings.get<number>('max-age-ms')) ?? 60 * 60 * 1000;
  if (!Number.isFinite(maxAgeMs) || maxAgeMs <= 0) {
    throw new Error('max-age-ms must be a positive finite number');
  }
  const cutoff = now - maxAgeMs;
  await cleanupMods(cutoff, deadline);
  await cleanupPosts(cutoff, deadline);
  return {};
}

/** Unmods eligible accounts added before the cutoff. */
async function cleanupMods(cutoff: number, deadline: number): Promise<void> {
  const subredditName = ctx.subredditName;
  const appSlug = ctx.appSlug.toLowerCase();
  const mods = await reddit.getModerators({ subredditName }).all();
  console.log(`Processing ${mods.length} mods`);
  for (const mod of mods) {
    if (Date.now() >= deadline) return;
    const username = mod.username.toLowerCase();
    if (EXCLUDED_ACCOUNTS.has(username) || username === appSlug) continue;
    if (!(mod.date.getTime() < cutoff)) continue;
    try {
      await reddit.removeModerator(mod.username, subredditName);
      console.log(`Unmodded ${mod.username} in r/${subredditName}`);
    } catch (err) {
      console.error(`Could not unmod ${mod.username} in r/${subredditName}`, err);
    }
  }
}

/** Removes posts by non-moderators and posts created before the cutoff. */
async function cleanupPosts(cutoff: number, deadline: number): Promise<void> {
  if (Date.now() >= deadline) return;
  const subredditName = ctx.subredditName;
  const posts = await reddit
    .getNewPosts({ subredditName, limit: PAGE_SIZE, pageSize: PAGE_SIZE })
    .all();
  console.log(`Processing ${posts.length} posts`);
  if (!posts.length || Date.now() >= deadline) return;
  const mods = new Set(
    (await reddit.getModerators({ subredditName }).all()).map((mod) => mod.username.toLowerCase())
  );

  for (const post of posts) {
    if (Date.now() >= deadline) break;
    if (post.removed) continue;
    if (post.createdAt.getTime() >= cutoff && mods.has(post.authorName.toLowerCase())) {
      continue;
    }
    try {
      await post.remove(false);
      console.log(`Removed ${post.id} by ${post.authorName}`);
    } catch (err) {
      console.error(`Could not remove ${post.id} by ${post.authorName}`, err);
    }
  }
}
