import type { ModeratorPermission } from '../models/User.js';

export const MODERATOR_PERMISSIONS = [
  'all',
  'wiki',
  'posts',
  'access',
  'mail',
  'config',
  'flair',
  'chat_operator',
  'chat_config',
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

export function asModPermissions(permission: string): ModeratorPermission {
  if (MODERATOR_PERMISSIONS.includes(permission)) {
    return permission as ModeratorPermission;
  }

  throw new Error(`Invalid moderator permission: ${permission}`);
}
