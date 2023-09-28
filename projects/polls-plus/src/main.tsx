import { Devvit } from '@devvit/public-api';
import { VotePage } from './components/VotePage.js';
import { ResultsPage } from './components/ResultsPage.js';
import { PageType, PollProps } from './PollModels.js';
import { addPoll } from './components/CreatePoll.js';
import { KeyType, key, userKey, resetRedis } from './PollHelpers.js';
import { ConfirmPage } from './components/ConfirmPage.js';

Devvit.debug.emitSnapshots = true;

Devvit.configure({
  redis: true,
  redditAPI: true,
});

const App: Devvit.CustomPostComponent = async (context) => {
  const useState = context.useState;
  const redis = context.redis;
  const postId = context.postId;
  const userId = context.userId;

  const [page, navigate] = useState(async () => {
    let hasVoted = false;
    try {
      hasVoted = !!(await redis.get(userKey(userId, postId)));
    } catch {
      //
    }
    return hasVoted ? PageType.RESULTS : PageType.VOTE;
  });

  useState(async () => {
    if (postId) return;

    // Load fixture data in dev mode.
    if (!(await redis.get(key(KeyType.question, `undefined`)))) {
      await resetRedis(context);
    }
  });

  const [currentUserId] = useState(userId);

  const [options] = useState(async () => {
    const options = await redis.zRange(key(KeyType.options, postId), 0, -1);
    return options.map((option) => option.member);
  });

  const [votes, setVotes] = useState(async () => {
    const rsp = await redis.mget(options.map((_option, i) => `polls:${postId}:${i}`));
    return rsp.map((count) => parseInt(count || '0'));
  });

  /* Want to know how many skips? ¯\_(ツ)_/¯
  const [skips, setSkips] = useState(async () => {
    return await redis.get(`polls:${postId}:${-2}`);
  });
  console.log(`skips - ${skips}`)
  */

  const reset = async (): Promise<void> => {
    await resetRedis(context);
    setVotes([0, 0, 0]);
    setFinish(new Date().getTime() + 5 * 60 * 1000);
  };

  const total = votes.reduce((a, b) => a + b, 0);

  const now = new Date().getTime();
  const [finish, setFinish] = useState(async () => {
    const finish = await redis.get(key(KeyType.finish, postId));
    return parseInt(finish || '0');
  });
  const remainingMillis = finish - now;

  const [description, _setDescription] = useState(async () => {
    return await redis.get(key(KeyType.description, postId));
  });

  const [allowShowResults, _setAllowShowResults] = useState(async () => {
    const allow = await redis.get(key(KeyType.allowShowResults, postId));
    return allow === 'true';
  });

  const [randomizeOrder, _setRandomizeOrder] = useState(async () => {
    const randomize = await redis.get(key(KeyType.randomizeOrder, postId));
    return randomize === 'true';
  });

  const optionsPerPollPage = 4;
  const pollPages = Math.ceil(options.length / optionsPerPollPage);

  const props: PollProps = {
    navigate,
    options,
    optionsPerPollPage,
    pollPages,
    setFinish,
    votes,
    description,
    finish,
    total,
    setVotes,
    remainingMillis,
    allowShowResults,
    randomizeOrder,
    reset,
  };

  if (!currentUserId) {
    return (
      <hstack grow alignment={'center middle'}>
        <text>Not logged in</text>
      </hstack>
    );
  } else if (page === PageType.VOTE && remainingMillis > 0) {
    return <VotePage {...props} />;
  } else if (page === PageType.CONFIRM && remainingMillis > 0) {
    return <ConfirmPage {...props} />;
  } else {
    return <ResultsPage {...props} />;
  }
};

Devvit.addMenuItem({
  label: 'Create a new poll',
  location: 'subreddit',
  onPress: (_event, context) => {
    context.ui.showForm(addPoll);
  },
});

Devvit.addCustomPostType({
  name: 'Polls Plus',
  description: 'Polls but better',
  render: App,
});

export default Devvit;
