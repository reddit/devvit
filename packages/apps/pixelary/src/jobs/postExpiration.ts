import { Devvit } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import { JobData } from '../types/job-data.js';

export const postExpiration = Devvit.addSchedulerJob<JobData>({
  name: 'PostExpiration',
  onRun: async (event, context) => {
    const { reddit } = context;
    const { postId, answer } = event.data!;
    const service = new Service(context);
    const gameSettings = await service.getGameSettings();

    const [, , comment] = await Promise.all([
      service.expirePost(postId),
      reddit.setPostFlair({
        subredditName: gameSettings.subredditName,
        postId: postId,
        flairTemplateId: gameSettings.endedFlairId,
      }),
      answer
        ? reddit.submitComment({
            id: postId,
            text: `The answer was: ${answer}`,
          })
        : Promise.resolve(null),
    ]);

    if (comment) {
      await comment.distinguish(true);
    }
  },
});
