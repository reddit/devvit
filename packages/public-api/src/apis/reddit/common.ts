export const RunAs = {
  APP: 0,
  USER: 1,
} as const;

export type RunAs = (typeof RunAs)[keyof typeof RunAs];
