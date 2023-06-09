import { Context, Devvit } from '@devvit/public-api';
import { VotePage } from './components/VotePage.js';

import { ResultsPage } from './components/ResultsPage.js';

import numbroImport from 'numbro';

/* eslint-disable @typescript-eslint/no-explicit-any */
const numbro = numbroImport as unknown as any;

Devvit.configure({
  redis: true,
  redditAPI: true,
});

export enum PageType {
  VOTE,
  RESULTS,
}

export interface PollProps {
  navigate: (page: PageType) => void;
  remainingMillis: number;
  options: string[];
  votes: number[];
  setVotes: (votes: number[]) => void;
  setFinish: (timestamp: number) => void;
  finish: number;
  total: number;
  reset: () => Promise<void>;
}

export const formatCount = (count: number) => {
  return numbro(count).format({
    average: true,
    mantissa: 1,
    optionalMantissa: true,
    trimMantissa: true,
    thousandSeparated: true,
  });
};

const App: Devvit.CustomPostComponent = async ({ redis, useState, postId, userId }: Context) => {
  const [page, navigate] = useState(PageType.VOTE);

  /**
   * this only happens in the development environment, where postId is undefined.  This is a hack
   * to reset the state of the poll.  Also, the debug panel would be available.
   */
  const resetRedis = async () => {
    await redis.mset({
      'polls:undefined:question': 'What is your favorite color?',
      'polls:undefined:finish': new Date().getTime() + 5 * 60 * 1000 + '',
      'polls:undefined:0': '0',
      'polls:undefined:1': '0',
      'polls:undefined:2': '0',
    });
    const voteds = await redis.zRange(`polls:undefined:voted`, 0, -1);
    if (voteds.length > 0) {
      await redis.del(...voteds.map((voted) => voted.member));
    }
    await redis.del(`polls:undefined:voted`);
    await redis.zAdd(
      `polls:undefined:options`,
      {
        member: 'Red',
        score: 0,
      },
      {
        member: 'Green',
        score: 1,
      },
      {
        member: 'Blue',
        score: 2,
      }
    );
    console.log('I reset the state');
  };

  useState(async () => {
    if (postId) return;

    // Load fixture data in dev mode.
    if (!(await redis.get('polls:undefined:question'))) {
      await resetRedis();
    }
  });

  const [options] = useState(async () => {
    const options = await redis.zRange(`polls:${postId}:options`, 0, -1);
    return options.map((option) => option.member);
  });

  const [votes, setVotes] = useState(async () => {
    const rsp = await redis.mget(options.map((_option, i) => `polls:${postId}:${i}`));
    return rsp.map((count) => parseInt(count || '0'));
  });

  const reset = async () => {
    await resetRedis();
    setVotes([0, 0, 0]);
    setFinish(new Date().getTime() + 5 * 60 * 1000);
  };

  const total = votes.reduce((a, b) => a + b, 0);

  const now = new Date().getTime();
  const [finish, setFinish] = useState(async () => {
    const answer = await redis.get(`polls:${postId}:finish`);
    console.log('reading state', `polls:${postId}:finish`, answer);
    return parseInt(answer || '0');
  });
  console.log(finish, 'finish');
  const remainingMillis = finish - now;

  const props: PollProps = {
    navigate,
    options,
    setFinish,
    votes,
    finish,
    total,
    setVotes,
    remainingMillis,
    reset,
  };

  if (!userId) {
    return <hstack grow>Not logged in</hstack>;
  } else if (page === PageType.VOTE && remainingMillis > 0) {
    return <VotePage {...props} />;
  } else {
    return <ResultsPage {...props} />;
  }
};

Devvit.addCustomPostType({
  name: 'Polls',
  description: 'Basic polls',
  render: App,
});

const addPoll = Devvit.createForm(
  {
    title: 'Add a poll!',
    fields: [
      {
        name: 'question',
        label: 'Question',
        type: 'string',
      },
      {
        name: 'answers',
        label: 'Answers (comma-delimited)',
        type: 'string',
      },
      {
        name: 'days',
        label: 'Days to allow voting',
        type: 'string',
      },
    ],
  },
  async (event, { reddit, subredditId, ui, redis }) => {
    const sub = await reddit.getSubredditById(subredditId);
    const answers = event.values.answers
      .split(',')
      .map((answer: string, i: number) => ({ member: answer.trim(), score: i }));
    const options = {
      subredditName: sub.name,
      title: event.values.question,
      preview: (
        <hstack>
          <text>loading...</text>
        </hstack>
      ),
    };
    const post = await reddit.submitPost(options);

    const timestamp = new Date().getTime() + parseInt(event.values.days) * 24 * 60 * 60 * 1000;

    await redis.set(`polls:${post.id}:finish`, timestamp + '');
    await redis.set(`polls:${post.id}:question`, event.values.question);
    await redis.zAdd(`polls:${post.id}:options`, answers);
    ui.showToast('Poll created!');
  }
);

Devvit.addMenuItem({
  label: 'Add a poll!',
  location: 'subreddit',
  onPress: (_event, context) => {
    context.ui.showForm(addPoll);
  },
});

export default Devvit;
