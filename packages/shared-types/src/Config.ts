import type { DependencySpec, Permissions } from '@devvit/protos/json/devvit/runtime/bundle.js';
import type { Definition } from '@devvit/protos/lib/Types.js';

import type { AssetMap } from './Assets.js';
import type { Namespace } from './Namespace.js';

/**
 * Bundle configuration for code about to be built (eg, dependencies). All
 * Bundle config state that impacts building should be recorded in the
 * implementation. See Actor subclass constructors.
 *
 * This type is = kind of like a builder pattern where export() is the build
 * method. Devvit almost implements this class.
 */
export type Config = {
  readonly assets: Readonly<AssetMap>;

  readonly providedDefinitions: Readonly<Definition>[];
  readonly webviewAssets?: Readonly<AssetMap> | undefined;

  export(namespace: Readonly<Namespace>): DependencySpec;

  provides(definition: Readonly<Definition>): void;

  use<T>(definition: Readonly<Definition>): T;

  /**
   * Check if a previous call to `use` was made. This is useful for allowing polyfills
   * to ensure that they can provide functionality in terms of a plugin, or fallback to
   * default functionality if not
   */
  uses(definition: Readonly<Definition>): boolean;

  addPermissions?(permissions: Readonly<Permissions>): void;

  getPermissions(): Readonly<Permissions>[];
};
