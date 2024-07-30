#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
// JSON imports are experimental, so we need to disable the warning

import { Errors, flush, run } from '@oclif/core';

run(undefined, import.meta.url)
  .then(() => flush())
  .catch(Errors.handle);
