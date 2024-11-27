import type { MenuItem } from '@devvit/public-api';

import { Service } from '../service/Service.js';

export const revealWord: MenuItem = {
  label: '[Pixelary] Reveal Word',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const service = new Service(context);
    const postType = await service.getPostType(event.targetId);
    // Return early for unsupported post types
    if (postType !== 'drawing') return;
    const data = await service.getDrawingPost(event.targetId);
    context.ui.showToast(data.word);
  },
};
