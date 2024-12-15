import type { CommentCreateDefinition } from '@devvit/public-api';

import bannedWords from '../data/bannedWords.json';

export const commentCreate: CommentCreateDefinition = {
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    if (!event.comment) return;

    const commentBody = event.comment?.body.toLowerCase() ?? '';
    const isSpam = bannedWords.some((bannedWord) => commentBody.includes(bannedWord.toLowerCase()));

    if (!isSpam) return;

    const comment = await context.reddit.getCommentById(event.comment.id);
    await Promise.all([comment.remove(isSpam), comment.lock()]);
  },
};
