/**
 * Bundle programs export an Actor subclass or the Devvit singleton. Actor
 * instances receive a runtime Config to register services and resolve clients.
 * Builders use devvit.json or supplied dependency metadata and do not
 * instantiate actors.
 *
 * Devvit is an Actor subclass singleton with a non-class-based API.
 *
 * `instanceof` and `isPrototypeOf()` tests fail because Devvit and Actor
 * are multiply defined.
 *
 * The Bootstrap actor injects the Config used to set up runtime links.
 */

import type { Config } from './Config.js';

/**
 * Base class for actors initialized with a runtime Config. Subclasses can
 * register services with config.provides() and resolve clients with config.use().
 */
export abstract class Actor {
  constructor(
    // @ts-expect-error ignore unused variable without a _ prefix.
    config: Config
  ) {}
}
