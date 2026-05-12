// eslint-disable-next-line no-restricted-imports
import type {
  FullAppInfo,
  GetAppBySlugRequest,
} from '@devvit/protos/types/devvit/dev_portal/app/app.js';
// eslint-disable-next-line no-restricted-imports
import type { AppClient } from '@devvit/protos/types/devvit/dev_portal/dev_portal.twirp-client.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { TwirpError, TwirpErrorCode } from 'twirp-ts';

export async function getAppBySlug(
  appClient: AppClient,
  request: GetAppBySlugRequest
): Promise<FullAppInfo | undefined> {
  try {
    const appInfo = await appClient.GetBySlug(request);
    return appInfo.app ? appInfo : undefined;
  } catch (err) {
    if (err instanceof TwirpError) {
      if (err.code === TwirpErrorCode.NotFound) {
        return undefined;
      }
      if (err.code === TwirpErrorCode.PermissionDenied) {
        return undefined;
      }
    }
    throw StringUtil.caughtToString(err, 'message');
  }
}
