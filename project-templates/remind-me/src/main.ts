import {
  ConfigFormBuilder,
  Context,
  Devvit,
  PostContextActionEvent,
  RedditAPIClient,
} from '@devvit/public-api';
import { Metadata } from '@devvit/protos';
import * as chrono from 'chrono-node';

/**
 * The Scheduler plugin lets us run code later or on a Cron-like schedule
 */
const scheduler = Devvit.use(Devvit.Types.Scheduler);

/**
 * The Reddit API client lets us make calls to the Reddit API.
 * To use it, we must instantiate it at the top of our main.ts file.
 */
const reddit = new RedditAPIClient();

const REMIND_ME_ACTION_ID = 'remindme';

Devvit.addAction({
  context: Context.POST,
  name: 'Remind me later',
  description: 'Remind me about this in the future',
  /**
   * We can request an input form from the frontend by providing
   * a ConfigForm to the userInput field.  The ConfigFormBuilder facilitates generating
   * the proper ConfigForm object.
   *
   * In this app we'll ask when the user would like to be reminded and
   * use the chrono-node library to interpret user input as a regular
   * sentence like "in two weeks" to generate the timestamp when we'll
   * wake back up and send a private message to the original caller.
   */
  userInput: new ConfigFormBuilder()
    // Add a text field
    // Other options:
    //  - textarea:     multiline text input
    //  - numberField:  limit input to a number
    //  - booleanField: present a toggle switch or checkbox for a true/false value
    //  (more to come!)
    .textField('when', 'When should I remind you?')
    .build(),
  handler: remindMeHandler,
});

async function remindMeHandler(event: PostContextActionEvent, metadata?: Metadata) {
  let success = true;
  let message: string;

  /**
   * First let's make sure the user filled out the form and gave us a valid answer
   */
  // find and extract the value from 'when':
  const whenStr = event.userInput?.fields.find((f) => f.key === 'when')?.response || '';
  if (!whenStr) {
    // if empty or null, don't do anything
    success = false;
    message = `I don't know when to remind you!`;
    return { success, message };
  }

  // for now all form data is returned as a serialized JSON object, so parse it first
  const parsedTime = chrono.parseDate(JSON.parse(whenStr));
  const now = new Date();

  if (parsedTime < now) {
    // another input check
    success = false;
    message = `I can't remind you in the past!`;
  } else {
    /**
     * Each method has an optional second parameter called `metadata` which contains
     * environment variables such as the logged in user's ID.
     * The Reddit API client can use this to get the current user like so:
     */
    const currentUser = await reddit.getCurrentUser(metadata);

    /**
     * Schedule an action to run at the specified date.
     * The `action` parameter is an object that expects a `type` which is an
     * arbitrary string you provide and behaves the same way as `actionId` so
     * you can determine what to do when the Scheduler runs your action.
     * The `data` parameter is an object you have complete control over to fill
     * with any data you'll need to run the scheduled action later.  In this case
     * we need to remember who the user was and what Post they interacted with to
     * send them a private message in the future.
     * (See `onHandleScheduledAction()` below for more info)
     */
    await scheduler.Schedule(
      {
        action: {
          type: REMIND_ME_ACTION_ID,
          data: {
            userId: currentUser.id,
            postId: `t3_${event.post.id}`,
            fromWhen: now,
          },
        },
        when: parsedTime,
        cron: undefined,
      },
      metadata
    );
    message = `Gotcha! I'll send you a message about this post at ${parsedTime}!`;
  }

  /**
   * Finally, return the status from calling OnAction to provide feedback to the user
   */
  return { success, message };
}

/**
 * In order to schedule an action the script that calls `Scheduler.Schedule` MUST
 * implement the SchedulerHandler interface and provide an implementation of
 * `onHandleScheduledAction`.  The input args here is the ScheduledActionRequest
 * we created when we called `Scheduler.Schedule` above.
 */
Devvit.addSchedulerHandler({
  type: REMIND_ME_ACTION_ID,
  async handler(event, metadata) {
    const { userId, postId, fromWhen } = event.data!;

    const user = await reddit.getUserById(userId, metadata);
    const post = await reddit.getPostById(postId, metadata);

    /**
     * Compose sends a private message to a user.
     * - The `to` field requires a username, not a fullname which is all we get from metadata
     * - The `text` field supports the same markdown features as text posts on Reddit
     *
     * NOTE: Apps are executed as the moderator that installed this app into a
     *       subreddit and will be used as the user that sends this message!
     */
    await reddit.sendPrivateMessage(
      {
        to: user.username,
        subject: 'RemindMe',
        text: `Beep boop! You asked me to remind you about [${post.title}](${post.permalink}) at ${fromWhen}!`,
      },
      metadata
    );
  },
});

export default Devvit;
