import type { UIEvent, UIRequest } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import type { JSONValue } from '@devvit/shared-types/json.js';
import { _latestBlocksHandler } from './BlocksHandler.js';
import type { HookRef } from './types.js';

export const findHookId = (ref: HookRef): string => {
  return ref.id!;
};

export const findHookState = (ref: HookRef): JSONValue => {
  return _latestBlocksHandler!._latestRenderContext!._state[ref.id!];
};

export const EmptyRequest: UIRequest = { events: [] };

export const generatePressRequest = (ref: HookRef): UIRequest => {
  const event: UIEvent = {
    hook: ref.id!,
    userAction: {
      actionId: ref.id!,
    },
  };
  return {
    state: _latestBlocksHandler?._latestRenderContext?._state ?? {},
    events: [event],
  };
};

export const generateTimerRequest = (ref: HookRef): UIRequest => {
  const event: UIEvent = {
    hook: ref.id!,
    timer: {},
  };
  return {
    state: _latestBlocksHandler?._latestRenderContext?._state ?? {},
    events: [event],
  };
};

export const mockMetadata = {
  [Header.AppUser]: {
    values: ['t2_appuser'],
  },
  [Header.Subreddit]: {
    values: ['t5_devvit'],
  },
  [Header.User]: {
    values: ['t2_user'],
  },
};
