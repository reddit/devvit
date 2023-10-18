import { VerifiedPublicImageHosts } from '@devvit/ui-renderer/blocks/templates/constants.js';

export const APPROVED_DOMAINS = VerifiedPublicImageHosts;

export const POST_DATA_KEY = (postId: string): string => `countdown_${postId}`;
export const POST_REMINDERS_KEY = (postId: string): string => `reminders_${postId}`;
export const POST_SCHEDULED_ACTION_KEY = (postId: string): string => `scheduled_action_${postId}`;

export const REMIND_USERS_ACTION_ID = 'remind_countdown_subscribers';

export const ONE_MINUTE_IN_MS = 1000 * 60;
