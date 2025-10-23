import type { Devvit } from '../devvit/Devvit.js';
import type { JSONObject } from './json.js';

export type ScheduledJob = {
  /** ID of the scheduled job. Use this with scheduler.cancelJob to cancel the job. */
  id: string;
  /** The name of the scheduled job type */
  name: string;
  /** Additional data passed in by the scheduler client */
  data: JSONObject | undefined;
  /** The Date of when this job should run */
  runAt: Date;
};

export type ScheduledCronJob = {
  /** ID of the scheduled job. Use this with scheduler.cancelJob to cancel the job. */
  id: string;
  /** The name of the scheduled job type */
  name: string;
  /** Additional data passed in by the scheduler client */
  data?: JSONObject | undefined;
  /** The cron string of when this job should run */
  cron: string;
};

export type ScheduledJobOptions<T extends JSONObject | undefined = JSONObject | undefined> = {
  /** The name of the scheduled job type */
  name: string;
  /** Additional data passed in by the scheduler client */
  data?: T;
  /** The Date of when this job should run */
  runAt: Date;
};

export type ScheduledCronJobOptions<T extends JSONObject | undefined = JSONObject | undefined> = {
  /** The name of the scheduled job type */
  name: string;
  /** Additional data passed in by the scheduler client */
  data?: T;
  /** The cron string of when this job should run */
  cron: string;
};

/**
 * Schedule a new job to run at a specific time or on a cron schedule
 * @param job The job to schedule
 * @returns {} The id of the scheduled job
 */
export type RunJob<Data extends JSONObject | undefined> = (
  job: ScheduledJobOptions<Data> | ScheduledCronJobOptions<Data>
) => Promise<string>;
/**
 * Cancel a scheduled job
 * @param jobId The id of the job to cancel
 */
export type CancelJob = (jobId: string) => Promise<void>;

/**
 * The Scheduler client lets you schedule new jobs or cancel existing jobs.
 * You must have the `scheduler` enabled in `Devvit.configure` to use this client.
 */
export type Scheduler = {
  /**
   * Schedule a new job to run at a specific time or on a cron schedule
   * @param job The job to schedule
   * @returns {string} The id of the scheduled job
   */
  runJob: <Data extends JSONObject | undefined>(
    job: ScheduledJobOptions<Data> | ScheduledCronJobOptions<Data>
  ) => Promise<string>;
  /**
   * Cancel a scheduled job
   * @param jobId The id of the job to cancel
   */
  cancelJob: CancelJob;
  /**
   * Gets the list of all scheduled jobs.
   */
  listJobs: () => Promise<(ScheduledJob | ScheduledCronJob)[]>;
};

export type ScheduledJobEvent<T extends JSONObject | undefined> = {
  /** The name of the scheduled job */
  name: string;
  /** Additional data passed in by the scheduler client */
  data: T;
};

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
