// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';
import {
  ScheduledPostJobName,
  createNewThreadPost,
  getThreadInfoById,
  resetScheduledPosts,
  scheduleNextPost,
} from './PostManager.js';
import { PostComponent } from './components/Post.js';
import { AppSettingsList } from './AppSettings.js';
import { WeatherComponent, getTheWeather } from './plugins/weather/Weather.js';
import { TitleComponent } from './plugins/title/TitleComponent.js';
import { TopicComponent, getTopic } from './plugins/topic/Topic.js';
import { RulesComponent } from './plugins/rules/RulesComponent.js';
import { getLeaderboard } from './plugins/leaderboard/Leaderboard.js';
import { LeaderboardComponent } from './plugins/leaderboard/LeaderboardComponent.js';
import { TriviaComponent, getTrivia } from './plugins/trivia/Trivia.js';
import { getPoll, vote } from './plugins/poll/Poll.js';
import { PollComponent } from './plugins/poll/PollComponent.js';

Devvit.configure({
  http: true,
  redditAPI: true,
  redis: true,
});

export const AppName = 'Daily Thread';

// Add moderator configuration settings for app
Devvit.addSettings(AppSettingsList);

// Add a menu item to the subreddit menu
// for instantiating a manual new custom post
Devvit.addMenuItem({
  label: `${AppName}: Create Manual New Post & Reset Schedule`,
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const result = await createNewThreadPost(context);
    await resetScheduledPosts(context);
    context.ui.showToast({
      text: result.success ? `Created new ${AppName}!` : `Failed to create new ${AppName}`,
      appearance: result.success ? 'success' : 'neutral',
    });
  },
});

// Add a custom post type definition
Devvit.addCustomPostType({
  name: `${AppName}`,
  height: 'tall',
  render: async (context) => {
    const { useState, postId } = context;
    const components: JSX.Element[] = [];

    const [postInfo, topic, weather, trivia, leaderboardStats, pollData] = await Promise.all([
      getThreadInfoById(postId, context),
      getTopic(context),
      getTheWeather(context),
      getTrivia(context),
      getLeaderboard(context),
      getPoll(context),
    ]);
    const [poll, setPoll] = useState(pollData);

    if (postInfo) {
      components.push(TitleComponent({ postInfo, showDate: true }, context));
    }

    if (topic) {
      components.push(TopicComponent({ topic }, context));
    }

    if (weather) {
      components.push(WeatherComponent({ weather }, context));
    }

    if (trivia) {
      components.push(TriviaComponent({ trivia }, context));
    }

    if (poll) {
      const voteAction = async (option: string): Promise<void> => {
        await vote(context, option);
        const poll = await getPoll(context);
        setPoll(poll);
      };
      components.push(PollComponent({ poll, voteAction }, context));
    }

    if (leaderboardStats) {
      components.push(LeaderboardComponent({ stats: leaderboardStats }, context));
    }

    if (postInfo?.rules) {
      components.push(RulesComponent({ rules: postInfo.rules }, context));
    }

    return PostComponent(components);
  },
});

Devvit.addSchedulerJob({
  name: ScheduledPostJobName,
  onRun: async (_, context) => {
    await createNewThreadPost(context);
    await scheduleNextPost(context);
  },
});

export default Devvit;
