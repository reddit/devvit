// eslint-disable-next-line no-restricted-imports
import type { UserActions } from '@devvit/protos/types/devvit/plugin/useractions/useractions.js';

export const userActionsPlugin = {
  Comment: vi.fn(),
  Submit: vi.fn(),
  SubmitCustomPost: vi.fn(),
} satisfies UserActions;
