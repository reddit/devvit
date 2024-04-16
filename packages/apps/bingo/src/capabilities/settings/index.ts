import { Devvit, SettingScope } from '@devvit/public-api';
import { theme } from '../../constants.js';
import { ApprovedDomainsFormatted, validateImageUrlSetting } from '../../utils/utils.js';

Devvit.addSettings([
  {
    name: 'theme_appBgImg',
    label: 'Custom background image url (optional)',
    type: 'string',
    scope: SettingScope.Installation,
    helpText: `Allowed domains: ${ApprovedDomainsFormatted}`,
    defaultValue: '',
    onValidate: validateImageUrlSetting,
  },
  {
    name: 'theme_logoImg',
    label: 'Custom logo image url (optional)',
    type: 'string',
    scope: SettingScope.Installation,
    helpText: `Allowed domains: ${ApprovedDomainsFormatted}`,
    defaultValue: '',
    onValidate: validateImageUrlSetting,
  },
  {
    name: 'theme_logoImgWidth',
    label: 'Custom logo image width (only needed if using custom logo)',
    type: 'number',
    scope: SettingScope.Installation,
    defaultValue: theme.standard.logoImgWidth,
    helpText: `Width of the logo when the height is 32px`,
  },
  {
    name: 'theme_appBackgroundColor',
    label: 'Custom background color (optional)',
    type: 'string',
    scope: SettingScope.Installation,
    defaultValue: theme.standard.appBackgroundColor,
    helpText: `Post background color`,
  },
  {
    name: 'theme_tileBg',
    label: 'Custom tile background color (optional)',
    type: 'string',
    scope: SettingScope.Installation,
    defaultValue: theme.standard.tileBg,
    helpText: `Initial tile background color`,
  },
  {
    name: 'theme_tileBgActive',
    label: 'Custom complete tile background color (optional)',
    type: 'string',
    scope: SettingScope.Installation,
    defaultValue: theme.standard.tileBgActive,
    helpText: `Tile background color when marked as complete`,
  },
  {
    name: 'theme_tileBorder',
    label: 'Custom tile border color (optional)',
    type: 'string',
    scope: SettingScope.Installation,
    defaultValue: theme.standard.tileBorder,
    helpText: `Initial tile border color`,
  },
  {
    name: 'theme_tileBorderActive',
    label: 'Custom complete tile border color (optional)',
    type: 'string',
    scope: SettingScope.Installation,
    defaultValue: theme.standard.tileBorderActive,
    helpText: `Tile border color when marked as complete`,
  },
  {
    name: 'theme_tileText',
    label: 'Custom tile text color (optional)',
    type: 'string',
    scope: SettingScope.Installation,
    defaultValue: theme.standard.tileText,
    helpText: `Initial tile text color`,
  },
  {
    name: 'theme_tileTextActive',
    label: 'Custom complete tile text color (optional)',
    type: 'string',
    scope: SettingScope.Installation,
    defaultValue: theme.standard.tileTextActive,
    helpText: `Tile text color when marked as complete`,
  },
]);

export type BingoSettings = {
  theme_appBgImg: string;
  theme_logoImg: string;
  theme_logoImgWidth: number;
  theme_appBackgroundColor: string;
  theme_tileBg: string;
  theme_tileBgActive: string;
  theme_tileBorder: string;
  theme_tileBorderActive: string;
  theme_tileText: string;
  theme_tileTextActive: string;
};
