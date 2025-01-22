import { Devvit, type FormField } from '@devvit/public-api';

import { handleNuke, handleNukePost } from './nuke.js';

Devvit.configure({
  redditAPI: true,
  modLog: true,
});

const nukeFields: FormField[] = [
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
] as const;

const nukeForm = Devvit.createForm(
  () => {
    return {
      fields: nukeFields,
      title: 'Mop Comments',
      acceptLabel: 'Mop',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, context) => {
    if (!values.lock && !values.remove) {
      context.ui.showToast('You must select either lock or remove.');
      return;
    }

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

const nukePostForm = Devvit.createForm(
  () => {
    return {
      fields: nukeFields,
      title: 'Mop Post Comments',
      acceptLabel: 'Mop',
      cancelLabel: 'Cancel',
    };
  },
  async ({ values }, context) => {
    if (!values.lock && !values.remove) {
      context.ui.showToast('You must select either lock or remove.');
      return;
    }

    if (!context.postId) {
      throw new Error('No post ID');
    }

    const result = await handleNukePost(
      {
        remove: values.remove,
        lock: values.lock,
        skipDistinguished: values.skipDistinguished,
        postId: context.postId,
        subredditId: context.subredditId,
      },
      context
    );
    console.log(`Mop result - ${result.success ? 'success' : 'fail'} - ${result.message}`);
    context.ui.showToast(`${result.success ? 'Success' : 'Failed'} : ${result.message}`);
  }
);

Devvit.addMenuItem({
  label: 'Mop post comments',
  description: 'Remove all comments of this post. This might take a few seconds to run.',
  location: 'post',
  forUserType: 'moderator',
  onPress: (_, context) => {
    context.ui.showForm(nukePostForm);
  },
});

export default Devvit;
