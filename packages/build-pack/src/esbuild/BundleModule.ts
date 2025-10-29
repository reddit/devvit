import { createRequire } from 'node:module';

import * as protos from '@devvit/protos'; // The bootstrap provides protos.
import { Actor } from '@devvit/shared-types/Actor.js';
import type { Config } from '@devvit/shared-types/Config.js';

// Define require for server builds which may have externalized dependencies.
// ESM does not define require but bundles are CJS and evaluated inline .
globalThis.require ??= createRequire(import.meta.url);

// because we evaluate the code to create the actor bundle webbit apps fail because they cannot
// open their HTTP port. This overrides http.createServer().listen(), so it's a no-op
// TODO When we stop needing to execute code in the bundler, we can remove this. I suspect once
//  devvit.json is fully implemented, we won't need this anymore. Also be sure to update
//  packages/server/src/create-server.ts to remove the matching code.
const webbitBundlingHack = `
  globalThis.enableWebbitBundlingHack = true;
`;
const webbitBundlingHackRevert = ` 
  globalThis.enableWebbitBundlingHack = false;
`;

/**
 * Dangerously executes untrusted code and returns the Actor class. An Error is
 * thrown if the code does not adhere to the BundleModule interface.
 */
export async function dangerouslyGetBundleActor(code: string): Promise<ConcreteActorType> {
  const ActorClass = await dangerouslyGetBundleDefaultExport(code);
  if (ActorClass == null) throw Error(`Missing default export: ${code}`);

  if (typeof ActorClass !== 'function')
    throw Error('Default export is not a function; expected Actor subclass.');

  // Actor is multiply defined so `instanceof` and `isPrototypeOf()` tests fail.

  return ActorClass;
}

/**
 * Dangerously executes untrusted code and returns the default export, if any.
 * The function is asynchronous because we don't know if there are top-level
 * awaits in the code.
 * @deprecated
 */
async function dangerouslyGetBundleDefaultExport(
  code: string
): Promise<ConcreteActorType | undefined> {
  const module: Partial<BundleModule<ConcreteActorType>> = {};

  // The bootstrap provides protos.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const require = function (path: string): unknown {
    if (path === '@devvit/protos') return protos;
    return globalThis.require(path);
  };

  // JS please forgive us
  // TODO DX-63
  // eslint-disable-next-line security/detect-eval-with-expression
  eval(webbitBundlingHack + code + webbitBundlingHackRevert);

  return module.exports?.default;
}

/**
 * Every Bundle program is expected to adhere to this type by exporting
 * an Actor subclass (or Devvit).
 */
type BundleModule<T extends ConcreteActorType> = {
  exports: { default: T | Promise<T> };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ConcreteActor extends Actor {
  constructor(cfg: Config) {
    super(cfg);
  }
}

/** For typing only, a fake instantiable Actor subclass. */
export type ConcreteActorType = typeof ConcreteActor;
