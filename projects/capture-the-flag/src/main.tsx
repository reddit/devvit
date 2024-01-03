import { Devvit } from '@devvit/public-api';
import { CaptureTheFlag } from './components/CaptureTheFlag.js';
import { Preview } from './components/Preview.js';
import { getDefaultTournamentState } from './types/state.js';
import { setGameOverScheduler } from './scheduler.js';
import { saveTournamentStateRisky } from './api.js';
import { hoursToMs } from './utils.js';

Devvit.configure({
  redditAPI: true,
  media: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Capture the Flag',
  height: 'tall',
  render: CaptureTheFlag,
});

type TournamentConfig = {
  duration_hours: number;
};

const TournamentConfigForm = Devvit.createForm(
  {
    title: 'Create a CTF Tournament',
    fields: [
      {
        name: 'duration_hours',
        label: 'Duration (in hours)',
        type: 'number',
        required: true,
        defaultValue: 1,
      },
    ],
    acceptLabel: 'Create',
  },
  async (event, { reddit, redis, ui, scheduler }) => {
    try {
      const formData = event.values as TournamentConfig;
      const duration = formData.duration_hours;
      if (!duration || typeof duration !== 'number' || duration <= 0) {
        throw new Error('invalid config');
      }
      const subreddit = await reddit.getCurrentSubreddit();
      const post = await reddit.submitPost({
        preview: <Preview />,
        title: 'Capture the Flag!',
        subredditName: subreddit.name,
      });
      const tournamentStartTimestamp = Date.now();
      await saveTournamentStateRisky(
        redis,
        post.id,
        getDefaultTournamentState(tournamentStartTimestamp)
      );

      const tournamentEndTimestamp = tournamentStartTimestamp + hoursToMs(duration);
      await setGameOverScheduler(post.id, tournamentEndTimestamp, scheduler, redis);

      ui.showToast({
        text: `Successfully created the tournament for ${duration} ${
          duration === 1 ? 'hour' : 'hours'
        }!`,
      });
    } catch (e) {
      console.log(event.values);
      ui.showToast('Something went wrong, please try again later.');
    }
  }
);

Devvit.addMenuItem({
  label: 'Create CTF Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, { ui }) => {
    ui.showForm(TournamentConfigForm);
  },
});

export default Devvit;
