export const REDD_IT: string = 'redd.it';
export const REDDIT_STATIC: string = 'redditstatic.com';
export const REDDIT_MEDIA: string = 'redditmedia.com';
export const SNOO_DEV: string = 'snoo.dev';

export const APPROVED_DOMAINS: string[] = [REDD_IT, REDDIT_STATIC, REDDIT_MEDIA];
export const ApprovedDomainsFormatted: string = APPROVED_DOMAINS.map(
  (domain) => `"${domain}"`
).join(', ');

export const POST_DATA_KEY = (postId: string): string => `countdown_${postId}`;
export const POST_REMINDERS_KEY = (postId: string): string => `reminders_${postId}`;
export const POST_SCHEDULED_ACTION_KEY = (postId: string): string => `scheduled_action_${postId}`;

export const REMIND_USERS_ACTION_ID: string = 'remind_countdown_subscribers';

export const ONE_MINUTE_IN_MS: number = 1000 * 60;
