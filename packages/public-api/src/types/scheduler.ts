import type { Data } from './data.js';
import type { Devvit } from '../devvit/Devvit.js';

export type ScheduledJob = {
  /** ID of the scheduled job. Use this with scheduler.cancelJob to cancel the job. */
  id: string;
  /** The name of the scheduled job type */
  name: string;
  /** Additional data passed in by the scheduler client */
  data: Data | undefined;
  /** The Date of when this job should run */
  runAt: Date;
};

export type ScheduledCronJob = {
  /** ID of the scheduled job. Use this with scheduler.cancelJob to cancel the job. */
  id: string;
  /** The name of the scheduled job type */
  name: string;
  /** Additional data passed in by the scheduler client */
  data: Data | undefined;
  /** The cron string of when this job should run */
  cron: string;
};

export type ScheduledJobOptions = {
  /** The name of the scheduled job type */
  name: string;
  /** Additional data passed in by the scheduler client */
  data?: Data | undefined;
  /** The Date of when this job should run */
  runAt: Date;
};

export type ScheduledCronJobOptions = {
  /** The name of the scheduled job type */
  name: string;
  /** Additional data passed in by the scheduler client */
  data?: Data | undefined;
  /** The cron string of when this job should run */
  cron: string;
};

/**
 * Schedule a new job to run at a specific time or on a cron schedule
 * @param job The job to schedule
 * @returns {} The id of the scheduled job
 */
export type RunJob = (job: ScheduledJobOptions | ScheduledCronJobOptions) => Promise<string>;
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
   * @returns {} The id of the scheduled job
   */
  runJob: RunJob;
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

export type ScheduledJobEvent = {
  /** The name of the scheduled job */
  name: string;
  /** Additional data passed in by the scheduler client */
  data?: Data | undefined;
};

export type ScheduledJobHandler = (
  event: ScheduledJobEvent,
  context: Omit<Devvit.Context, 'ui' | 'dimensions' | 'modLog' | 'uiEnvironment'>
) => void | Promise<void>;

export type ScheduledJobType = {
  /** The name of the scheduled job type */
  name: string;
  /** The function that will be called when the job is scheduled to run */
  onRun: ScheduledJobHandler;
};
