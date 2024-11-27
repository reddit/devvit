import type { MenuItem } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

import { GuessScreenSkeleton } from '../posts/DrawingPost/GuessScreenSkeleton.js';
import { Service } from '../service/Service.js';
// import { Block } from '@devvit/protos';
// import * as BlocksReconciler from '@devvit/public-api/devvit/internals/blocks/BlocksReconciler.js';

export const updatePostPreview: MenuItem = {
  label: 'Update post preview',
  location: 'post',
  forUserType: 'moderator',
  postFilter: 'currentApp',
  onPress: async (event, context) => {
    const service = new Service(context);
    const postType = await service.getPostType(event.targetId);
    if (postType !== 'drawing') {
      context.ui.showToast('Not a drawing post');
      return;
    }

    const [drawing, playerCount, post] = await Promise.all([
      service.getDrawingPost(event.targetId),
      service.getPlayerCount(event.targetId),
      context.reddit.getPostById(event.targetId),
    ]);

    const winPercentage = Math.round((drawing.solves / playerCount) * 100);

    const preview = () => (
      <GuessScreenSkeleton
        drawing={drawing.data}
        playerCount={playerCount}
        winPercentage={winPercentage}
        dictionaryName={drawing.dictionaryName}
      />
    );

    /*
    async function jsxLength(jsx: JSX.ComponentFunction): Promise<number> {
      const reconciler = new (BlocksReconciler as any).BlocksReconciler(jsx, undefined, undefined, {
        'devvit-subreddit': { values: [''] },
        'devvit-app-user': { values: [''] },
      });
      const block = (await reconciler.buildBlocksUI()) as Block;
      const output = Block.encode(block).finish();
      console.log('Output:', output);
      return output.length;
    }

    console.log('Preview:', await jsxLength(preview));
    */

    try {
      await post.setCustomPostPreview(preview);
      context.ui.showToast('Preview updated!');
    } catch (error) {
      console.error('Error setting custom post preview', error);
      context.ui.showToast('Failed to update preview');
      return;
    }
  },
};
