import type { SettingsFormField } from '@devvit/public-api';

export enum APIKey {
  soccer = `sr-soccer-api-key`,
  nfl = `sr-nfl-api-key`,
  nba = `sr-nba-api-key`,
  ncaamb = `sr-ncaamb-api-key`,
  cricket = `sr-cricket-api-key`,
  gsNflFixture = `gs-nfl-fixture-api-key`,
  gsNflMatchState = `gs-nfl-matchstate-api-key`,
  gsNflFixtureProd = `gs-nfl-fixture-api-key-prod`,
  gsNflMatchStateProd = `gs-nfl-matchstate-api-key-prod`,
}

export enum AuthKey {
  gsNflFixtureClientId = `gs-nfl-fixture-client-id`,
  gsNflFixtureClientSecret = `gs-nfl-fixture-client-secret`,
  gsNflMatchStateClientId = `gs-nfl-matchstate-client-id`,
  gsNflMatchStateClientSecret = `gs-nfl-matchstate-client-secret`,
  gsNflFixtureClientIdProd = `gs-nfl-fixture-client-id-prod`,
  gsNflFixtureClientSecretProd = `gs-nfl-fixture-client-secret-prod`,
  gsNflMatchStateClientIdProd = `gs-nfl-matchstate-client-id-prod`,
  gsNflMatchStateClientSecretProd = `gs-nfl-matchstate-client-secret-prod`,
}

export enum AppSettings {
  enableDynamicCachedLoader = 'enable-dynamic-cached-loader',
}

export const settingsFields: SettingsFormField[] = [
  {
    name: APIKey.soccer,
    label: 'Sportradar Soccer API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: APIKey.nfl,
    label: 'Sportradar NFL API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: APIKey.nba,
    label: 'Sportradar NBA API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: APIKey.ncaamb,
    label: 'Sportradar NCAA Mens Basketball API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AppSettings.enableDynamicCachedLoader,
    label: 'Use a dynamic cached loader for posts',
    type: 'string',
    isSecret: false,
    scope: 'app',
    defaultValue: 'DISABLED',
  },
  {
    name: APIKey.cricket,
    label: 'Sportradar Cricket API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: APIKey.gsNflFixture,
    label: 'GS NFL Fixture API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: APIKey.gsNflMatchState,
    label: 'GS NFL Matchstate API Key',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AuthKey.gsNflFixtureClientId,
    label: 'GS NFL Fixture Client ID',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AuthKey.gsNflFixtureClientSecret,
    label: 'GS NFL Fixture Client Secret',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AuthKey.gsNflMatchStateClientId,
    label: 'GS NFL Matchstate Client ID',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AuthKey.gsNflMatchStateClientSecret,
    label: 'GS NFL Matchstate Client Secret',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: APIKey.gsNflFixtureProd,
    label: 'GS NFL Fixture API Key - PROD',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: APIKey.gsNflMatchStateProd,
    label: 'GS NFL Matchstate API Key - PROD',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AuthKey.gsNflFixtureClientIdProd,
    label: 'GS NFL Fixture Client ID - PROD',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AuthKey.gsNflFixtureClientSecretProd,
    label: 'GS NFL Fixture Client Secret - PROD',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AuthKey.gsNflMatchStateClientIdProd,
    label: 'GS NFL Matchstate Client ID - PROD',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
  {
    name: AuthKey.gsNflMatchStateClientSecretProd,
    label: 'GS NFL Matchstate Client Secret - PROD',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
];
