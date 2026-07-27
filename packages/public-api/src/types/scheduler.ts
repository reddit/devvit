import type { ScheduledJobEvent, SchedulerClient } from '@devvit/scheduler';

export type {
  CancelJob,
  RunJob,
  ScheduledCronJob,
  ScheduledCronJobOptions,
  ScheduledJob,
  ScheduledJobEvent,
  ScheduledJobOptions,
} from '@devvit/scheduler';

import type { Devvit } from '../devvit/Devvit.js';
import type { JSONObject } from './json.js';

export type Scheduler = SchedulerClient;

export type ScheduledJobHandler<Data extends JSONObject | undefined = JSONObject | undefined> = (
  event: ScheduledJobEvent<Data>,
  context: JobContext
) => void | Promise<void>;

export type JobContext = Omit<Devvit.Context, 'ui' | 'dimensions' | 'modLog' | 'uiEnvironment'>;

export type ScheduledJobType<Data extends JSONObject | undefined> = {
  /** The name of the scheduled job type */
  name: string;
  /** The function that will be called when the job is scheduled to run */
  onRun: ScheduledJobHandler<Data>;
};
