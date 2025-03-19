import { RunAs as _RunAs } from '@devvit/protos';

export const RunAs = {
  APP: _RunAs.APP,
  USER: _RunAs.USER,
} as const;

export type RunAs = (typeof RunAs)[keyof typeof RunAs];
