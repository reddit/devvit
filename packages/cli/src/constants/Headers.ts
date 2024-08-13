import { Header } from '@devvit/shared-types/Header.js';

import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packagePath = require.resolve('@devvit/cli/package.json');
const { version } = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));

export type HeaderTuple = readonly [key: string, val: string];

export const HEADER_AUTHORIZATION = (token: string): HeaderTuple => {
  return ['authorization', `bearer ${token}`];
};
export const HEADER_USER_AGENT = (): HeaderTuple => [
  'user-agent',
  `Devvit/CLI/${version} Node/${process.version.replace(/^v/, '')}`,
];

export const HEADER_DEVVIT_CLI = (): HeaderTuple => ['x-devvit-cli', 'true'];
export const HEADER_DEVVIT_CANARY = (val: string): HeaderTuple => {
  return [Header.Canary, val];
};
