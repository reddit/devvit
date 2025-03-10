import { RunAs as _RunAs } from '@devvit/protos/types/devvit/plugin/redditapi/common/common_msg.js';

export const RunAs = {
  APP: _RunAs.APP,
  USER: _RunAs.USER,
} as const;

export type RunAs = (typeof RunAs)[keyof typeof RunAs];
