import type { Devvit, SettingsFormField } from '@devvit/public-api';
import { timezoneOptions } from './utils/Time.js';

export enum AppSetting {
  ThreadTitle = 'thread_title',
  HeaderTitle = 'header_title',
  HourOfDayToPost = 'hour_of_day_to_post',
  Timezone = 'timezone',
  Rules = 'rules',
}

const DefaultValues: Record<AppSetting, string> = {
  [AppSetting.ThreadTitle]: 'Daily Thread',
  [AppSetting.HeaderTitle]: `What's on your mind today?`,
  [AppSetting.HourOfDayToPost]: '04:00',
  [AppSetting.Timezone]: 'America/New_York',
  [AppSetting.Rules]: `Don't be a jerk. Be kind to one another.`,
};

export async function getAppSettingValue(
  name: AppSetting,
  context: Devvit.Context
): Promise<string> {
  const value = await context.settings.get(name);
  switch (name) {
    case AppSetting.ThreadTitle:
      return (value as string) ?? DefaultValues[AppSetting.ThreadTitle];
    case AppSetting.HeaderTitle:
      return (value as string) ?? DefaultValues[AppSetting.HeaderTitle];
    case AppSetting.HourOfDayToPost:
      return (value as string) ?? DefaultValues[AppSetting.HourOfDayToPost];
    case AppSetting.Timezone:
      if (value === undefined) {
        return DefaultValues[AppSetting.Timezone];
      }
      return (value as string[])[0];
    case AppSetting.Rules:
      return (value as string) ?? DefaultValues[AppSetting.Rules];
    default:
      return '';
  }
}

export const AppSettingsList: SettingsFormField[] = [
  {
    name: AppSetting.ThreadTitle,
    label: 'Title of the post',
    helpText:
      'This is the title of the post that will be created. Changing this will only apply to future posts.',
    type: 'string',
    scope: 'installation',
    defaultValue: DefaultValues[AppSetting.ThreadTitle],
  },
  {
    name: AppSetting.HeaderTitle,
    label: 'Title for header',
    helpText:
      'This is the header title that can be displayed at the top of the post. Changing this will only apply to future posts.',
    type: 'string',
    scope: 'installation',
    defaultValue: DefaultValues[AppSetting.HeaderTitle],
  },
  {
    name: AppSetting.HourOfDayToPost,
    label: 'Create new post at this hour of the day (00:00 to 23:59)',
    helpText: 'e.g. 00:15 for 12:15am, 08:00 for 8am, 20:30 for 8:30pm, etc.',
    type: 'string',
    scope: 'installation',
    defaultValue: DefaultValues[AppSetting.HourOfDayToPost],
  },
  {
    name: AppSetting.Timezone,
    label: 'Timezone',
    helpText: 'Select the timezone you want the post to be created in.',
    type: 'select',
    options: timezoneOptions,
    defaultValue: [DefaultValues[AppSetting.Timezone]],
  },
  {
    name: AppSetting.Rules,
    label: 'Rules for the daily thread',
    helpText:
      'These rules can displayed in the post. Changing this will only apply to future posts.',
    type: 'string',
    scope: 'installation',
    defaultValue: DefaultValues[AppSetting.Rules],
  },
];
