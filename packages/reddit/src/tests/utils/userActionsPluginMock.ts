import type { UserActions } from '@devvit/protos';

export const userActionsPlugin = {
  Comment: vi.fn(),
  Submit: vi.fn(),
  SubmitCustomPost: vi.fn(),
} satisfies UserActions;
