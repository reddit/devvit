import type { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
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
};

// to-do: unit test.
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

  await emitEffect({
    type: 9 satisfies EffectType.EFFECT_WEB_VIEW,
    share: {
      appIconUri: iconRsp?.ok ? iconURL : undefined,
      userData: opts.data,
      text: opts.text,
      title: opts.title,
    },
  });
}

export function getShareData(): string | undefined {
  return devvit.share?.userData;
}
