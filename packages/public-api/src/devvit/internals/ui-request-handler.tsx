import type { CustomPost, Definition, Metadata, MethodDefinition, UIRequest } from '@devvit/protos';
import { CustomPostDefinition, UIResponse } from '@devvit/protos';
import type { Config } from '@devvit/shared-types/Config.js';

import { Devvit } from '../Devvit.js';
import { BlocksHandler } from './blocks/handler/BlocksHandler.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';
import {
  makeUpgradeAppComponent,
  parseDevvitUserAgent,
  shouldShowUpgradeAppScreen,
} from './upgrade-app-shim.js';

const FeatureUnavailable: Devvit.BlockComponent = () => (
  <vstack alignment="center middle" width="100%" height="100%">
    <text>This feature is not available yet</text>
  </vstack>
);

/**
 * Extend me to add new surfaces to Devvit.
 */
const UIComponentBindings: [Definition, MethodDefinition, JSX.ComponentFunction][] = [
  [
    CustomPostDefinition,
    CustomPostDefinition.methods['renderPostContent'],
    (_props: {}, context: Devvit.Context) => Devvit.customPostType?.render(context) ?? null,
  ],
  [
    CustomPostDefinition,
    CustomPostDefinition.methods['renderPostComposer'],
    (_props: {}, _context: Devvit.Context) => <FeatureUnavailable />,
  ],
];

export function makeHandler(
  component: JSX.ComponentFunction
): (req: UIRequest, metadata: Metadata) => Promise<UIResponse> {
  return async (req: UIRequest, metadata: Metadata) => {
    const parsedUserAgent = parseDevvitUserAgent(metadata['devvit-user-agent']?.values?.[0] ?? '');
    if (parsedUserAgent && shouldShowUpgradeAppScreen(parsedUserAgent)) {
      const handler = new BlocksHandler(makeUpgradeAppComponent(parsedUserAgent.platform));
      return UIResponse.fromJSON(await handler.handle(req, metadata));
    }

    const handler = new BlocksHandler(component);
    return UIResponse.fromJSON(await handler.handle(req, metadata));
  };
}

export function registerUIRequestHandlers(config: Config): void {
  for (const [definition, method, component] of UIComponentBindings) {
    config.provides(definition);
    extendDevvitPrototype<CustomPost>(method.name as keyof CustomPost, makeHandler(component));
  }
}
