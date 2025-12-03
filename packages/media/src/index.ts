import { MediaClient } from './MediaClient.js';

export type { MediaClient };
export type * from './types/media.js';

export const media: MediaClient = new MediaClient();
