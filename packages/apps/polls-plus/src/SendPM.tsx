import { RedditAPIClient } from '@devvit/public-api';

export async function sendPM(reddit: RedditAPIClient): Promise<void> {
  const currentUser = await reddit.getCurrentUser();

  if (!currentUser) {
    console.error(`No current user found, skipping send PM.`);
    return;
  }

  await reddit.sendPrivateMessage({
    to: currentUser.username,
    subject: 'Thanks for participating!',
    text: 'Come back later to see the results',
  });
}
