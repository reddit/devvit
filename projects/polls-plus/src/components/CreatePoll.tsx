import { Devvit, ZMember } from '@devvit/public-api';
import { key, KeyType } from '../PollHelpers.js';

export const addPoll = Devvit.createForm(
  {
    title: 'Add a poll',
    fields: [
      {
        name: 'question',
        label: 'Question',
        type: 'string',
        required: true,
        helpText: `E.g. What is your favorite color?`,
      },
      // Description will be used as post selftext, once that is supported for custom posts
      // {
      //   name: `description`,
      //   label: `Description (Optional)`,
      //   type: `string`,
      // },
      {
        name: 'answers',
        label: 'Answers (use a comma to separate)',
        type: 'paragraph',
        required: true,
        helpText: `E.g. "Red, Orange, Blue, Mother of Pearl"`,
      },
      {
        name: 'days',
        label: 'Days to allow voting',
        type: 'string',
        defaultValue: `2`,
        required: true,
      },
      // {
      //   name: 'randomizeOrder',
      //   label: 'Randomize order of poll options',
      //   type: 'boolean',
      //   defaultValue: true,
      //   helpText: `To reduce bias, options will be presented to the user in a random order.`
      // },
      {
        name: 'allowShowResults',
        label: 'Include "Show Results" option',
        type: 'boolean',
        defaultValue: true,
        helpText: `This allow users to see poll results without voting. Users cannot vote after viewing the results.`,
      },
    ],
  },
  async (event, { reddit, subredditId, ui, redis }) => {
    const sub = await reddit.getSubredditById(subredditId);
    const answers: ZMember[] = event.values.answers
      .split(',')
      .map((answer: string, i: number) => ({ member: answer.trim(), score: i }));
    const options = {
      subredditName: sub.name,
      title: event.values.question,
      // text: "TODO - description/selftext",
      preview: (
        <hstack alignment={'center middle'}>
          <text>Loading...</text>
        </hstack>
      ),
    };
    const post = await reddit.submitPost(options);

    const timestamp = new Date().getTime() + parseInt(event.values.days) * 24 * 60 * 60 * 1000;
    const allowShowResults = event.values.allowShowResults ? 'true' : 'false';
    const randomizeOrder = event.values.randomizeOrder ? 'true' : 'false';

    await redis.set(key(KeyType.finish, post.id), timestamp + '');
    await redis.set(key(KeyType.question, post.id), event.values.question);
    await redis.set(key(KeyType.description, post.id), event.values.description);
    await redis.zAdd(key(KeyType.options, post.id), ...answers);
    await redis.set(key(KeyType.allowShowResults, post.id), allowShowResults);
    await redis.set(key(KeyType.randomizeOrder, post.id), randomizeOrder);

    ui.showToast('Poll created!');
  }
);
