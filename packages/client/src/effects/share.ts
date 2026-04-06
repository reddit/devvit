import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import type { T3 } from '@devvit/shared';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';
import { maxShareParamUserDataChars } from '@devvit/shared-types/client/share.js';
import { ICON_FILE_PATH } from '@devvit/shared-types/constants.js';

export type ShareSheetOpts = {
  /** Data to share. Must be 1024 characters or less. */
  data?: string | undefined;
  /** Title of share sheet. */
  title?: string | undefined;
  /** Body text of share sheet. */
  text?: string | undefined;
  /** Post to share. If not provided, a link to the current post will be shared. */
  post?: T3 | undefined;
};

// to-do: move to web view scripts.
/** Show the native share sheet or copy to clipboard depending on device. */
export async function showShareSheet(opts: Readonly<ShareSheetOpts>): Promise<void> {
  if (opts.data && opts.data.length > maxShareParamUserDataChars)
    throw Error(
      `data must be <= ${maxShareParamUserDataChars} characters but was ${opts.data.length} characters`
    );

  const iconURL = `${new URL(ICON_FILE_PATH, location.origin)}`;
  let iconRsp;
  try {
    iconRsp = await fetch(iconURL, { method: 'HEAD' });
  } catch {
    //
  }

  let url: string | undefined;
  if (opts.post) {
    const postWithoutPrefix = opts.post.replace('t3_', '');
    url = `https://reddit.com/comments/${postWithoutPrefix}`;
  }

  emitEffect({
    type: EffectType.EFFECT_WEB_VIEW,
    share: {
      appIconUri: iconRsp?.ok ? iconURL : undefined,
      userData: opts.data,
      text: opts.text,
      title: opts.title,
      url: url,
    },
  });
}

export function getShareData(): string | undefined {
  return devvit.share?.userData;
}
