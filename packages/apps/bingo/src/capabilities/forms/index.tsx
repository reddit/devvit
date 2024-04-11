import { Devvit } from '@devvit/public-api';
import { CreatePreview } from '../../components/Preview.js';
import { parse } from 'tldts';
import { BINGO_TILES_COUNT } from '../../constants.js';

export const REDD_IT: string = 'redd.it';
export const REDDIT_STATIC: string = 'redditstatic.com';
export const REDDIT_MEDIA: string = 'redditmedia.com';
export const APPROVED_DOMAINS: string[] = [REDD_IT, REDDIT_STATIC, REDDIT_MEDIA];
export const ApprovedDomainsFormatted: string = APPROVED_DOMAINS.map(
  (domain) => `"${domain}"`
).join(', ');

function isRedditImage(imageUrl: string | undefined): boolean {
  if (!imageUrl) {
    return true;
  }
  const domain = parse(imageUrl).domain;
  return APPROVED_DOMAINS.includes(domain || '');
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
        label: `Bingo answers (at least ${BINGO_TILES_COUNT} options, use a comma to separate)`,
        type: 'string',
        required: true,
      },
      {
        name: 'backgroundUrl',
        label: 'Custom background image url (optional)',
        type: 'string',
        required: false,
        helpText: `Allowed domains: ${ApprovedDomainsFormatted}`,
      },
    ],
  },
  async (event, { reddit, subredditId, ui, redis }) => {
    const answersRaw: string = event.values.answers;
    const answers: string[] = answersRaw
      .split(',')
      .map((answer) => answer.trim())
      .filter((answer) => Boolean(answer));

    if (answers.length < BINGO_TILES_COUNT) {
      ui.showToast(`Please enter at least ${BINGO_TILES_COUNT} answers`);
      return;
    }

    const isValidImage = isRedditImage(event.values.backgroundUrl);
    if (!isValidImage) {
      ui.showToast(`Please use images from ${ApprovedDomainsFormatted}.`);
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
    await redis.set(`${post.id}_bg`, event.values.backgroundUrl);

    ui.showToast(`Bingo board created!`);
    ui.navigateTo(post);
  }
);
