import type { TriggerContext } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

/*
Before you share your post to Discord and r/Devvit, this form will pop up.
It gives you a chance to read and update the message being sent.
*/

export const confirmationForm = Devvit.createForm(
  (data) => {
    return {
      fields: [
        {
          name: 'content',
          label: 'Discord message',
          type: 'string',
          defaultValue: data.content,
        },
        {
          name: 'title',
          label: 'r/hello_user post title',
          type: 'string',
          defaultValue: data.postTitle,
        },
      ],
      title: 'Share your post',
      description: 'Share the post with the Devvit community.',
      acceptLabel: 'Share',
    };
  },
  async ({ values }, context) => {
    const content = values.content;
    await sendToDiscord(content);
    const post = await context.reddit.getPostById(context.postId!);
    await post.crosspost({
      title: values.title,
      subredditName: 'hello_user',
      flairId: '1283585c-13b6-11ef-afb0-76f79bce0fa1',
    });
    await post.addComment({
      text: 'This post was made with Devvit! Make your own here: https://developers.reddit.com/docs/intro-to-devvit',
    });
    context.ui.navigateTo(`https://www.reddit.com/r/hello_user/new/`);
  }
);

/*
This function sends your post link to Discord.
The webhook is linked to a test channel in the Reddit Devs server.
Eventually, this will send posts to the intros channel.
*/
export async function sendToDiscord(content: string): Promise<void> {
  const webhook =
    'https://discord.com/api/webhooks/1239759949199048795/OD642VzTX08I9elKTuotU9J_Xd2IOD7QG36NhVRmO2IyigEYWEuhGKUhh2KaNs_xbWd_';
  const payload = { content: content };

  const response = await fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error('Error sending data to webhook');
  }
}

/*
This sends a modmail to the community the post is shared to.
A different app monitors modmail for messages with this subject & makes the app account an approved user.
This is in case the new app account is flagged by automated systems.
*/
export async function requestDevvitPostingPermissions(context: TriggerContext): Promise<void> {
  await context.reddit.sendPrivateMessage({
    to: 'hello_user',
    subject: 'e9f7affb6aa5b2ec2eb606ab8407949b',
    text: 'Intro template app approval',
  });
}
