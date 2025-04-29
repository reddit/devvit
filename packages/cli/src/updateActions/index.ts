import { createAssetsIfMissing } from './actions/createAssetsIfMissing.js';
import { migrateTsconfigToPublicAPI } from './actions/migrateTsconfigToPublicAPI.js';
import type { UpdateAction } from './types.js';

export const UPDATE_ACTIONS: UpdateAction[] = [createAssetsIfMissing, migrateTsconfigToPublicAPI];
