import { Definition } from '@devvit/protos/lib/Types.js';
import {
  ActorSpec,
  DependencySpec,
  PackageQuery,
  Permissions,
} from '@devvit/protos/types/devvit/runtime/bundle.js';

import type { AssetMap } from './Assets.js';
import type { Config } from './Config.js';
import { PLUGIN_NAME, resolveActorHostname } from './HostnameUtil.js';
import type { Namespace } from './Namespace.js';
import { NonNull } from './NonNull.js';

export type ClientFactory = {
  Build<T>(desc: Definition): T;
};

export class ConfigImpl implements Config {
  readonly assets: Readonly<AssetMap>;
  readonly webviewAssets: Readonly<AssetMap>;
  readonly #factory: ClientFactory;
  readonly #name: string | undefined;
  readonly #owner: string | undefined;
  readonly #provides: Readonly<Definition>[] = [];
  readonly #useQueries: PackageQuery[] = [];
  readonly #version: string | undefined;
  readonly #permissions: Readonly<Permissions>[] = [];

  constructor(
    factory: ClientFactory,
    actorSpec: ActorSpec,
    assets: AssetMap,
    webViewAssets: AssetMap
  ) {
    this.#factory = factory;
    this.#name = actorSpec.name;
    this.#owner = actorSpec.owner;
    this.#version = actorSpec.version;
    this.assets = Object.freeze(assets);
    this.webviewAssets = Object.freeze(webViewAssets);
  }

  export(namespace: Readonly<Namespace>): DependencySpec {
    return {
      actor: this.#newActorSpec(),
      hostname: resolveActorHostname(NonNull(this.#name), namespace),
      provides: this.#provides.map((definition) => {
        return {
          actor: this.#newActorSpec(),
          definition: Definition.toSerializable(definition),
          partitionsBy: [],
        };
      }),
      uses: this.#useQueries,
      permissions: this.#permissions,
    };
  }

  get providedDefinitions(): Readonly<Definition>[] {
    return this.#provides;
  }

  provides(definition: Readonly<Definition>): void {
    this.#provides.push(definition);
  }

  addPermissions(permissions: Readonly<Permissions>): void {
    this.#permissions.push(permissions);
  }

  use<T>(definition: Readonly<Definition>): T {
    const query = { name: PLUGIN_NAME, typeName: definition.fullName };
    this.#useQueries.push(query);
    return this.#factory.Build(definition);
  }

  uses(definition: Readonly<Definition>): boolean {
    return this.#useQueries.some((query) => query.typeName === definition.fullName);
  }

  getPermissions(): Readonly<Permissions>[] {
    return this.#permissions ?? [];
  }

  #newActorSpec(): ActorSpec {
    return {
      name: this.#name ?? '',
      owner: this.#owner ?? '',
      version: this.#version ?? '',
    };
  }
}
