#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
import CreateApp from '@devvit/cli/commands/init.js';

try {
  await CreateApp.run();
  process.exit(0);
} catch (err) {
  console.error('An error occurred during app creation:');
  console.error(err);
  process.exit(1);
}
