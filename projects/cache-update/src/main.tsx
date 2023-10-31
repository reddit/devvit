import { Devvit } from '@devvit/public-api';
import { createCustomPost } from './customPost.js';
import { startCron } from './scheduler.js';
import { AutoUpdateApp } from './AutoUpdateApp.js';
import { AutoUpdateCache } from './AutoUpdateCache.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Cache Updater',
  description: 'Creates posts that update their own cached render',
  render: () => {
    return <AutoUpdateApp />;
  },
});

Devvit.addMenuItem({
  label: 'Create auto-updating post',
  forUserType: 'moderator',
  location: 'subreddit',
  onPress: async (_, context) => {
    const { ui } = context;
    const post = await createCustomPost(
      context,
      'Auto-updating post',
      <AutoUpdateCache autoUpdateEnabled={true} initialPostTime={new Date()} />
    );

    ui.showToast(`Created post: ${post.id}`);

    await startCron(context, post.id);
  },
});

export default Devvit;
