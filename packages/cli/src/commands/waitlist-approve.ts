import { WaitlistStatus } from '@devvit/protos/community.js';
import { Args } from '@oclif/core';
import { getUserId, isCurrentUserEmployee } from '../lib/http/gql.js';
import { createWaitlistAdminClient } from '../util/clientGenerators.js';
import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { getAccessToken } from '../util/auth.js';

export default class WaitlistApprove extends DevvitCommand {
  static override description = 'Approve a user from the waitlist, adding them first if necessary.';

  static override hidden = true;

  static override args = {
    username: Args.string({
      description: 'Username to approve',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(WaitlistApprove);

    const token = await getAccessToken();
    if (!token) {
      this.error('Not currently logged in. Try `devvit login` first');
    }

    if (!(await isCurrentUserEmployee(token))) {
      this.error('You must be an employee to approve users');
    }

    const waitlistAdmin = createWaitlistAdminClient();

    const waitlistSignups = await waitlistAdmin.GetSubmissions({
      username: args.username,
      limit: 1,
    });
    let submissionId: string;
    if (waitlistSignups.count === 0) {
      const userId = await getUserId(args.username, token);

      await waitlistAdmin.AddSubmission({
        userId: userId,
        userName: args.username,
      });

      // In order to get the submission ID, we have to re-fetch the list. Really wish the ID was
      // returned by the AddSubmission call above, but that's a refactor for another day.
      const newWaitlistSignups = await waitlistAdmin.GetSubmissions({
        username: args.username,
        limit: 1,
      });
      submissionId = newWaitlistSignups.submissions[0].id;
    } else {
      submissionId = waitlistSignups.submissions[0].id;
    }

    await waitlistAdmin.UpdateSubmission({
      id: submissionId,
      status: WaitlistStatus.ACCEPTED,
    });

    this.log('Approved user!');
  }
}
