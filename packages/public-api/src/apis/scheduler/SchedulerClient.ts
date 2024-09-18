import type { Metadata } from '@devvit/protos';
import type { JSONObject } from '@devvit/shared-types/json.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';

import { Devvit } from '../../devvit/Devvit.js';
import type {
  ScheduledCronJob,
  ScheduledCronJobOptions,
  ScheduledJob,
  ScheduledJobOptions,
  Scheduler,
} from '../../types/scheduler.js';

export class SchedulerClient implements Scheduler {
  readonly #metadata: Metadata;

  constructor(metadata: Metadata) {
    this.#metadata = metadata;
  }

  async runJob(job: ScheduledJobOptions | ScheduledCronJobOptions): Promise<string> {
    const response = await Devvit.schedulerPlugin.Schedule(
      {
        action: {
          type: job.name,
          data: job.data,
        },
        cron: 'cron' in job ? job.cron : undefined,
        when: 'runAt' in job ? job.runAt : undefined,
      },
      this.#metadata
    );

    return response.id;
  }

  async cancelJob(jobId: string): Promise<void> {
    await Devvit.schedulerPlugin.Cancel(
      {
        id: jobId,
      },
      this.#metadata
    );
  }

  async listJobs(): Promise<(ScheduledJob | ScheduledCronJob)[]> {
    const response = await Devvit.schedulerPlugin.List(
      /**
       * after and before are required for this API to work
       * so we hardcode after to Unix epoch and before to 10 years from now
       * https://reddit.atlassian.net/browse/DX-3060
       */
      {
        after: new Date(0),
        before: new Date(Date.now() + 10 * 365 * 86400 * 1000),
      },
      this.#metadata
    );

    return response.actions.map((action) => {
      assertNonNull(action.request?.action, 'Scheduled job is malformed');

      if ('when' in action.request && action.request.when != null) {
        return {
          id: action.id,
          name: action.request.action.type,
          runAt: action.request.when,
          data: action.request.action.data as JSONObject | undefined,
        };
      }

      return {
        id: action.id,
        name: action.request.action.type,
        cron: action.request.cron ?? '',
        data: action.request.action as unknown as JSONObject | undefined,
      };
    });
  }
}
