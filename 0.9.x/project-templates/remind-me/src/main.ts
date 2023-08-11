import { Devvit, FormOnSubmitEvent } from '@devvit/public-api';
import * as chrono from 'chrono-node';

const REMIND_ME_JOB = 'remindmejob';

Devvit.configure({
  redditAPI: true, // Enable access to the Reddit API
});

Devvit.addMenuItem({
  label: 'Remind me later',
  location: 'post',
  onPress: async (event, context) => {
    // Gather user input
    context.ui.showForm(remindMeForm);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await context.scheduler.runJob({
      name: REMIND_ME_JOB,
      data: {
        userId: context.userId,
        postId: event.targetId,
      },
      runAt: tomorrow,
    });
  },
});

// Define a job that can be scheduled
Devvit.addSchedulerJob({
  name: REMIND_ME_JOB,
  onRun: async (event, context) => {
    const { userId, postId, fromWhen } = event.data!;

    const user = await context.reddit.getUserById(userId);
    const post = await context.reddit.getPostById(postId);

    await context.reddit.sendPrivateMessage({
      to: user.username,
      subject: 'RemindMe',
      text: `Beep boop! You asked me to remind you about [${post.title}](${post.permalink}) at ${fromWhen}!`,
    });
  },
});

// Define a form that will ask the user when to remind them
const remindMeForm = Devvit.createForm(
  {
    fields: [{ name: 'when', label: 'When?', type: 'string' }],
    title: 'Remind me',
    acceptLabel: 'Schedule',
  },
  remindMeHandler
);

async function remindMeHandler(event: FormOnSubmitEvent, context: Devvit.Context): Promise<void> {
  const whenStr = (event.values.when as string) || '';
  if (!whenStr) {
    context.ui.showToast("I don't know when to remind you!");
    return;
  }

  const parsedTime = chrono.parseDate(whenStr);
  const now = new Date();

  if (parsedTime < now) {
    context.ui.showToast("I can't remind you in the past!");
    return;
  }
  const currentUser = await context.reddit.getCurrentUser();

  // Schedule a job to run at the given time
  await context.scheduler.runJob({
    name: REMIND_ME_JOB,
    data: {
      userId: currentUser.id,
      postId: context.postId,
      fromWhen: now,
    },
    runAt: parsedTime,
  });

  context.ui.showToast(`Gotcha! I'll send you a message about this post at ${parsedTime}!`);
}

export default Devvit;
