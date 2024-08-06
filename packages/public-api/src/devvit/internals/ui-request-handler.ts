import type { Definition, Metadata, MethodDefinition, UIRequest } from '@devvit/protos';
import { CustomPostDefinition, UIResponse } from '@devvit/protos';
import type { Config } from '@devvit/shared-types/Config.js';
import { Devvit } from '../Devvit.js';
import { BlocksHandler } from './blocks/handler/BlocksHandler.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';

/**
 * Extend me to add new surfaces to Devvit.
 */
const UIComponentBindings: [[Definition, MethodDefinition, JSX.ComponentFunction]] = [
  [
    CustomPostDefinition,
    CustomPostDefinition.methods['renderPostContent'],
    (_props: {}, context: Devvit.Context) => Devvit.customPostType?.render(context) ?? null,
  ],
];

export function makeHandler(
  component: JSX.ComponentFunction
): (req: UIRequest, metadata: Metadata) => Promise<UIResponse> {
  return async (req: UIRequest, metadata: Metadata) => {
    const handler = new BlocksHandler(component);
    return UIResponse.fromJSON(await handler.handle(req, metadata));
  };
}

export function registerUIRequestHandlers(config: Config): void {
  for (const [definition, method, component] of UIComponentBindings) {
    config.provides(definition);
    extendDevvitPrototype(method.name, makeHandler(component));
  }
}
