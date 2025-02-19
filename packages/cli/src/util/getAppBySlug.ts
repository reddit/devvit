import type { AppClient, FullAppInfo, GetAppBySlugRequest } from '@devvit/protos/community.js';
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
