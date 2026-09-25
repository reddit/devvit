import type { WebViewUserProgressEffect_State } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/user_progress.js';

/** Carries accepted progress in HTTP headers and identifies its request-context callback. */
export const userProgressStateHeader = 'x-devvit-user-progress';

/** Progress states that can be delivered to the client. */
export type UserProgressState =
  | WebViewUserProgressEffect_State.STARTED
  | WebViewUserProgressEffect_State.COMPLETED;

/** Records progress to deliver before the current response sends its headers. */
export type UserProgressNotifier = (state: UserProgressState) => void;
