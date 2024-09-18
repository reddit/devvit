import type { z } from 'zod';

import type { Schema } from '../../api/Schema.js';
import type { PageProps } from '../../types/page.js';

export type Pin = z.infer<(typeof Schema)['pin']>;

export type CommonPinProps = Pick<
  PageProps,
  'context' | 'currentUserUsername' | 'isOwner' | 'isRMCAdmin' | 'navigate' | 'pinPost'
> & {
  updatePinPostPin: PageProps['pinPostMethods']['updatePinPostPin'];
};
