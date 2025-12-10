import { scheduler } from '@devvit/scheduler';
import { expect } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

test('can schedule and list jobs', async () => {
  const jobId = await scheduler.runJob({
    name: 'test-job',
    runAt: new Date(Date.now() + 1000),
    data: { key: 'value' },
  });

  expect(jobId).toBeDefined();

  const jobs = await scheduler.listJobs();
  expect(jobs.length).toBe(1);
  expect(jobs[0].id).toBe(jobId);
  expect(jobs[0].name).toBe('test-job');
  expect(jobs[0].data).toStrictEqual({ key: 'value' });
});

test('can cancel a job', async () => {
  const jobId = await scheduler.runJob({
    name: 'to-cancel',
    cron: '* * * * *',
  });

  await scheduler.cancelJob(jobId);

  const jobs = await scheduler.listJobs();
  expect(jobs).toHaveLength(0);
});
