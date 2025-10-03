export { context } from './clientContext.js';
export { navigateTo } from './effects/navigate-to.js';
export { canRunAsUser } from './effects/run-as-user.js';
export { getShareData, type ShareSheetOpts, showShareSheet } from './effects/share.js';
export { showForm } from './effects/show-form.js';
export { showToast } from './effects/show-toast.js';
export {
  addWebViewModeListener,
  exitExpandedMode,
  getWebViewMode,
  removeWebViewModeListener,
  requestExpandedMode,
} from './effects/web-view-mode.js';
export type { PostData } from '@devvit/shared-types/PostData.js';

import { registerListener } from './effects/web-view-mode.js';
registerListener();
