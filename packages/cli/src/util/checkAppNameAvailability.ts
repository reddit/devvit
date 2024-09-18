import type { AppAccountExistsResponse, AppClient } from '@devvit/protos/community.js';

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
