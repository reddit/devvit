import { Devvit } from '@devvit/public-api';

import { Pin } from '../components/Pin/Pin.js';
import type { PageProps } from '../types/page.js';

export const PinDetailPage = (props: PageProps): JSX.Element => {
  const {
    params,
    pinPost,
    context,
    currentUserUsername,
    isOwner,
    isRMCAdmin,
    navigate,
    pinPostMethods: { updatePinPostPin },
  } = props;
  const { pinId } = params;

  if (!pinId) {
    throw new Error(`pinId must be provided as a param to render page!`);
  }

  const pin = pinPost.pins.find((pin) => pin.id === pinId);

  if (!pin) {
    throw new Error(`Cannot find pin for pinId: ${pinId}`);
  }

  return (
    <Pin
      pin={pin}
      context={context}
      updatePinPostPin={updatePinPostPin}
      currentUserUsername={currentUserUsername}
      navigate={navigate}
      isOwner={isOwner}
      isRMCAdmin={isRMCAdmin}
      pinPost={pinPost}
    />
  );
};
