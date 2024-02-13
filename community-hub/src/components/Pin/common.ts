import { z } from 'zod';
import { PageProps } from '../../types/page.js';
import { Schema } from '../../api/Schema.js';

export type Pin = z.infer<(typeof Schema)['pin']>;

export type CommonPinProps = Pick<
  PageProps,
  'context' | 'currentUserUsername' | 'isOwner' | 'isRMCAdmin' | 'navigate' | 'pinPost'
> & {
  updatePinPostPin: PageProps['pinPostMethods']['updatePinPostPin'];
};
