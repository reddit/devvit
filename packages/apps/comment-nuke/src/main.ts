import { Devvit } from '@devvit/public-api';
import { handleNuke } from './nuke.js';

Devvit.configure({
  redditAPI: true,
  modLog: true,
});

const nukeForm = Devvit.createForm(
  () => {
    return {
      fields: [
        {
          name: 'remove',
          label: 'Remove comments',
          type: 'boolean',
          defaultValue: true,
        },
        {
          name: 'lock',
          label: 'Lock comments',
          type: 'boolean',
          defaultValue: false,
        },
        {
          name: 'skipDistinguished',
          label: 'Skip distinguished comments',
          type: 'boolean',
          defaultValue: false,
        },
      ],
      title: 'Mop Comments',
      acceptLabel: 'Mop',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, context) => {
    if (context.commentId) {
      const result = await handleNuke(
        {
          remove: values.remove,
          lock: values.lock,
          skipDistinguished: values.skipDistinguished,
          commentId: context.commentId,
          subredditId: context.subredditId,
        },
        context
      );
      console.log(`Mop result - ${result.success ? 'success' : 'fail'} - ${result.message}`);
      context.ui.showToast(`${result.success ? 'Success' : 'Failed'} : ${result.message}`);
    } else {
      context.ui.showToast(`Mop failed! Please try again later.`);
    }
  }
);

Devvit.addMenuItem({
  label: 'Mop comments',
  description: 'Remove this comment and all child comments. This might take a few seconds to run.',
  location: 'comment',
  forUserType: 'moderator',
  onPress: (_, context) => {
    context.ui.showForm(nukeForm);
  },
});

export default Devvit;
