import type { CommentDeleteDefinition } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import type { CommentId, PostId } from '../types.js';

export const commentDelete: CommentDeleteDefinition = {
  event: 'CommentDelete',
  onEvent: async (event, context) => {
    const service = new Service(context);
    const postId = event.postId as PostId;
    const commentId = event.commentId as CommentId;
    const word = await service.getGuessComment(postId, commentId);
    if (!word) return;
    await service.removeGuessComment(postId, commentId);
  },
};
