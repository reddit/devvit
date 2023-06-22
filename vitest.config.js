// @ts-expect-error
import { devvitVitestConfig } from '@devvit/tsconfig/base-vitest.config.js';

export default {
  ...devvitVitestConfig,
  test: {
    ...devvitVitestConfig.test,
    // Disable threading with worker_threads.
    // The vitest implementation of threading breaks `worker_thread`'s
    // as used from `web-worker` within `NodeRuntime`.
    //
    // Anything that depends on the `NodeRuntime` in tests
    // needs to disable threading for now.
    threads: false,
  },
};
