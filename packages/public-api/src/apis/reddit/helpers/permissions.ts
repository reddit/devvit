import type { ModeratorPermission } from '../models/User.js';

export const MODERATOR_PERMISSIONS = [
  'all',
  'wiki',
  'posts',
  'access',
  'mail',
  'config',
  'flair',
  'channels',
  'chat_config',
  'chat_operator',
  'community_chat',
];

export function formatPermissions(permissions: string[], allPermissions: string[]): string {
  return allPermissions
    .map((permission) => (permissions.includes(permission) ? '+' : '-') + permission)
    .join(',');
}

export function formatModeratorPermissions(permissions: string[]): string {
  return formatPermissions(permissions, MODERATOR_PERMISSIONS);
}

export function validModPermissions(permissions: string[]): ModeratorPermission[] {
  return permissions.filter((permission) =>
    MODERATOR_PERMISSIONS.includes(permission)
  ) as ModeratorPermission[];
}
