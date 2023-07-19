import { ContextAPIClients, Devvit } from '@devvit/public-api';

import { BlockGallery } from './components/BlockGallery.js';
import { GalleryState } from './state/state.js';

Devvit.addCustomPostType({
  name: 'Blocks Gallery',
  description: 'Demonstrates the blocks elements',
  render: (renderContext: ContextAPIClients) => {
    const state = new GalleryState(renderContext);
    return <BlockGallery state={state} />;
  },
});

export default Devvit;
