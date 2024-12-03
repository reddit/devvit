import type { TriggerContext } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

/* Adds a menu item to the custom post.
The button pops up a form to share your post to Discord */
export const shareButton = Devvit.addMenuItem({
  label: 'Share with devvit',
  location: 'post',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const post = await context.reddit.getPostById(context.postId!);
    const postTitle = post.title;
    const user = await context.reddit.getCurrentUser();
    const username = user?.username ?? 'user';
    const content = `Hi, I'm ${username}! Check out my app: ${post.url}`;
    context.ui.showForm(confirmationForm, { content, postTitle });
  },
});

/*
Before you share your post to r/hello_user and Discord, this form will pop up.
It gives you a chance to read and update the message being sent.
*/

export const confirmationForm = Devvit.createForm(
  (data) => {
    return {
      fields: [
        {
          name: 'title',
          label: 'r/hello_user post title',
          type: 'string',
          defaultValue: data.postTitle as string,
        },
      ],
      title: 'Share your post',
      description:
        'Share your work with the community. This will crosspost your creation to the r/hello_user gallery and a devvit discord feed dedicated to posts like these.',
      acceptLabel: 'Share',
    } as const;
  },
  async ({ values }, context) => {
    context.ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const creator = await context.redis.get('hell0_user');
    const currentUser = await context.reddit.getCurrentUser();
    if (creator !== currentUser?.username) {
      context.ui.showToast('You must be the post creator to share this with the community.');
      return;
    }
    const post = await context.reddit.getPostById(context.postId!);
    const newPost = await post.crosspost({
      title: values.title,
      subredditName: 'hello_user',
      flairId: '1283585c-13b6-11ef-afb0-76f79bce0fa1',
    });
    context.ui.navigateTo(`https://www.reddit.com${newPost.permalink}`);
  }
);

//gives your app posting permissions in r/hello_user
export const installTrigger = Devvit.addTrigger({
  event: 'AppInstall', // Event name from above
  onEvent: async (_, context) => {
    await requestPostingPermissions(context);
  },
});

/*
This sends a modmail to the community the post is shared to.
A different app monitors modmail for messages with this subject & makes the app account an approved user.
This is in case the new app account is flagged by automated systems.
*/
export async function requestPostingPermissions(context: TriggerContext): Promise<void> {
  await context.reddit.sendPrivateMessage({
    to: 'r/hello_user',
    subject: 'e9f7affb6aa5b2ec2eb606ab8407949b',
    text: 'Intro template app approval',
  });
}
