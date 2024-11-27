import type { MenuItem } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import type { JobData } from '../types/job-data.js';

export const expirePost: MenuItem = {
  label: '[Pixelary] Expire post',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const service = new Service(context);
    const postType = await service.getPostType(event.targetId);
    if (postType !== 'drawing') return;
    const data = await service.getDrawingPost(event.targetId);
    await context.scheduler.runJob<JobData>({
      name: 'PostExpiration',
      data: {
        postId: event.targetId,
        answer: data.word,
      },
      runAt: new Date(),
    });
    context.ui.showToast('Post expired');
  },
};
