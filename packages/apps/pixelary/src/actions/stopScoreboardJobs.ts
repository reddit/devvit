import type { MenuItem } from '@devvit/public-api';

/*
 * ADMIN: Menu actions to migrate r/Pixelary to latest version
 */

export const stopScoreboardJobs: MenuItem = {
  label: '[Pixelary] Stop Scoreboard Jobs',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const list = await context.scheduler.listJobs();
    const cancelations = list
      .filter((job) => job.name === 'UpdateScoreBoard')
      .map((job) => context.scheduler.cancelJob(job.id));
    await Promise.all(cancelations);
    context.ui.showToast(`Stopped ${cancelations.length} jobs`);
  },
};
