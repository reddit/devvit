import type { CommentDeleteDefinition } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const commentDelete: CommentDeleteDefinition = {
  event: 'CommentDelete',
  onEvent: async (event, context) => {
    const service = new Service(context);
    const word = await service.getGuessComment(event.postId, event.commentId);
    if (!word) return;
    await service.removeGuessComment(event.postId, event.commentId);
  },
};
