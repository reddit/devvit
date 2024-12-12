import type { MenuItem } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import type { PostId } from '../types.js';

export const revealWord: MenuItem = {
  label: '[Pixelary] Reveal Word',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const service = new Service(context);
    const postId = event.targetId as PostId;
    const postType = await service.getPostType(postId);
    if (postType !== 'drawing') {
      context.ui.showToast('Unknown post type');
      return;
    }
    const data = await service.getDrawingPost(postId);
    context.ui.showToast(data.word);
  },
};
