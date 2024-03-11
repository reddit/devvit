import { Devvit } from '@devvit/public-api';
import { CreatePreview } from '../../components/Preview.js';

export const BingoForm = Devvit.createForm(
  {
    title: 'Create bingo board',
    acceptLabel: 'Create Board',
    fields: [
      {
        name: 'title',
        label: 'Post Title',
        type: 'string',
        required: true,
        helpText: `What do you want your post title to be?`,
      },
      {
        name: 'answers',
        label: 'Bingo answers (exactly 16 options, use a comma to separate)',
        type: 'string',
        required: true,
      },
    ],
  },
  async (event, { reddit, subredditId, ui, redis }) => {
    const answersRaw: string = event.values.answers;
    const answers: string[] = answersRaw
      .split(',')
      .map((answer) => answer.trim())
      .filter((answer) => Boolean(answer));

    if (answers.length !== 16) {
      ui.showToast('Please enter exactly 16 answers');
      return;
    }

    const title: string = event.values.title;
    const subredditName = (await reddit.getSubredditById(subredditId))?.name;

    const post = await reddit.submitPost({
      title: `${title}`,
      subredditName,
      preview: CreatePreview(),
    });

    //store postID and answers in redis
    await redis.set(post.id, JSON.stringify(answers));

    ui.showToast(`Bingo board created!`);
    ui.navigateTo(post);
  }
);
