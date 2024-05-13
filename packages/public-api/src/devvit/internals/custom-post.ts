import type { Metadata, RenderPostRequest, RenderPostResponse } from '@devvit/protos';
import { CustomPostDefinition } from '@devvit/protos';
import type { DeepPartial } from '@devvit/shared-types/BuiltinTypes.js';
import type { Config } from '@devvit/shared-types/Config.js';
import { Devvit } from '../Devvit.js';
import { BlocksReconciler } from './blocks/BlocksReconciler.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';

async function renderPost(
  req: RenderPostRequest,
  metadata: Metadata
): Promise<DeepPartial<RenderPostResponse>> {
  const customPostType = Devvit.customPostType;

  if (!customPostType) {
    throw new Error('Custom post type not registered');
  }

  const reconciler = new BlocksReconciler(
    (_props, context) => customPostType.render(context),
    req.blocks,
    req.state,
    metadata,
    req.dimensions
  );

  const blocksUI = await reconciler.render();

  return {
    state: reconciler.state,
    blocks: {
      ui: blocksUI,
    },
    effects: reconciler.getEffects(),
  };
}

export function registerCustomPost(config: Config): void {
  config.provides(CustomPostDefinition);
  extendDevvitPrototype('RenderPost', renderPost);
}
