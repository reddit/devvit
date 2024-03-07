import { Devvit } from '@devvit/public-api';
import { CreatePreview } from '../../components/Preview.js';

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

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
    const answers: string[] = event.values.answers.split(',');
    // TODO add empty value validation
    if (answers.length !== 16) {
      ui.showToast('Please enter exactly 16 answers');
      return;
    }

    shuffleArray(answers); //shuffle the answers
    const title: string = event.values.title;
    const subredditName = (await reddit.getSubredditById(subredditId))?.name;

    const post = await reddit.submitPost({
      title: `${title}`,
      subredditName,
      preview: CreatePreview(),
    });

    //store postID and answers in redis
    await redis.set(post.id, JSON.stringify(answers));

    ui.navigateTo(post);
    ui.showToast(`Bingo board created!`);
  }
);
