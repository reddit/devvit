import type { MenuItem } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import type { PostId } from '../types.js';

export const updateDrawingPostPreview: MenuItem = {
  label: 'Update drawing preview',
  location: 'post',
  forUserType: 'moderator',
  postFilter: 'currentApp',
  onPress: async (event, context) => {
    const service = new Service(context);
    const postId = event.targetId as PostId;
    const postType = await service.getPostType(postId);
    if (postType !== 'drawing') {
      context.ui.showToast('Not a drawing post');
      return;
    }

    const [drawing, playerCount, user] = await Promise.all([
      service.getDrawingPost(postId),
      service.getPlayerCount(postId),
      context.reddit.getCurrentUser(),
    ]);

    if (drawing.authorUsername !== user?.username) {
      context.ui.showToast('Not the author');
      return;
    }

    await service.updateDrawingPostPreview(
      postId,
      drawing.data,
      playerCount,
      drawing.dictionaryName
    );
  },
};
