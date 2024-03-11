export const AllowedUsersSettingName = 'devvtools:allowed_users';
/**
 * Space separated list of usernames
 * username can only contain letters, numbers, "-", and "_"
 * multiple spaces are allowed and will be trimmed
 */
export const ValidUserString = /^[ a-zA-Z_\-1-9]+$/;
