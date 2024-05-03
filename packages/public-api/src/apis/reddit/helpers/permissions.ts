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
  'chat_community',
  'chat_operator',
];

export function formatPermissions(
  permissions: string[],
  allPermissions: string[],
  encodePlusSign: boolean = false
): string {
  const plus = encodePlusSign ? '%2b' : '+';
  return allPermissions
    .map((permission) => (permissions.includes(permission) ? plus : '-') + permission)
    .join(',');
}

export function formatModeratorPermissions(permissions: string[]): string {
  return formatPermissions(permissions, MODERATOR_PERMISSIONS, true);
}

export function validModPermissions(permissions: string[]): ModeratorPermission[] {
  return permissions.filter((permission) =>
    MODERATOR_PERMISSIONS.includes(permission)
  ) as ModeratorPermission[];
}
