/**
 * All Bundle programs are Actor subclasses. Actor instances are expected to
 * populate the passed in Config which is used by the builder to compile and
 * link the programs. Bundle programs are expected to export their subclass
 * constructor, either their own Actor subclass or Devvit.
 *
 * Devvit is an Actor subclass singleton with a non-class-based API.
 *
 * `instanceof` and `isPrototypeOf()` tests fail because Devvit and Actor
 * are multiply defined.
 *
 * Developers will, for now, implement this class and
 * utilize the the `cfg.use/provide` api for both:
 *
 * 1. specifying their `DependencySpec` (proto: devvit/runtime/bundle)
 *      Build packs will, for now, create an instance of the Actor and use the
 *      result of `config.export` for linking
 *
 * 2. When running within the overall system, `Bootstrap` actor will
 *      inject a config that is used to setup links within the runtime.
 */

import type { Config } from './Config.js';

/**
 * Subclasses are expected to call config.init(), provides(), and uses(). It
 * is erroneous to not override the constructor. Override, invoke
 * `super(config)`, and call the Config APIs.
 */
export abstract class Actor {
  constructor(
    // @ts-expect-error ignore unused variable without a _ prefix.
    config: Config
  ) {}
}
