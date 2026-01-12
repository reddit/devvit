import { NotificationsClient } from './NotificationsClient.js';

export type * from './types/notifications.js';
export { type NotificationsClient };

export const notifications = new NotificationsClient();
