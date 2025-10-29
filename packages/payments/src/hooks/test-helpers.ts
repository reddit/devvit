import type { UIRequest } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';

export const USE_STATE_HOOK_ID = 'Component.useState-0';
export const USE_ASYNC_HOOK_ID = 'Component.useAsync-1';
export const meta = {
  [Header.AppUser]: {
    values: ['t2_appuser'],
  },
  [Header.Subreddit]: {
    values: ['t5_devvit'],
  },
  [Header.App]: {
    values: ['app'],
  },
  [Header.Installation]: {
    values: ['install'],
  },
};

export const UI_STATE = {
  Loading: 'I am Loading...',
  DataLoaded: 'Data loaded!',
  Error: 'Encountered Error...',
} as const;

export const emptyRequest = (): UIRequest => ({
  events: [],
});

export function serializeLoadedDataState<T>(data: T) {
  return `${UI_STATE.DataLoaded} :  ${JSON.stringify(data)}`;
}
