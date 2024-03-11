import { Devvit, SettingScope } from '@devvit/public-api';
import { validateUserAllowlist } from '../../utils/utils.js';

/**
 * Space separated list of usernames
 * username can only contain letters, numbers, "-", and "_"
 * multiple spaces are allowed and will be trimmed
 */

Devvit.addSettings([
  {
    type: 'string',
    name: 'devvtools:allowed_users',
    label: 'Space-separated list of usernames allowed to see the developer tools',
    scope: SettingScope.Installation,
    onValidate: (event) => {
      return validateUserAllowlist(event.value!);
    },
  },
]);
