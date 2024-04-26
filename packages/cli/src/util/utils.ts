import type { AppClient, FullAppInfo } from '@devvit/protos';
import { GetAppBySlugRequest } from '@devvit/protos';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { TwirpError, TwirpErrorCode } from 'twirp-ts';

export async function getAppBySlug(
  appClient: AppClient,
  slug: string
): Promise<FullAppInfo | undefined> {
  try {
    const appInfo = await appClient.GetBySlug(GetAppBySlugRequest.fromPartial({ slug }));
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
    throw StringUtil.caughtToString(err);
  }
}
