import type { AppAccountExistsResponse } from '@devvit/protos/json/devvit/dev_portal/app/app.js';
// eslint-disable-next-line no-restricted-imports
import type { AppClient } from '@devvit/protos/types/devvit/dev_portal/dev_portal.twirp-client.js';

export async function checkAppNameAvailability(
  appClient: AppClient,
  name: string
): Promise<AppAccountExistsResponse> {
  const [appAccountExistsRes, appExistsRes] = await Promise.all([
    appClient.AppAccountExists({ accountName: name }),
    appClient.Exists({ slug: name }),
  ]);

  return {
    exists: appAccountExistsRes.exists || appExistsRes.exists,
    suggestions: appAccountExistsRes.suggestions,
  };
}
