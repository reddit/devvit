import { Actor } from '@devvit/shared-types/Actor.js';
import type { Config } from '@devvit/shared-types/Config.js';

// @ts-expect-error missing dependency.
import { num } from './missing-dep.js';

export default class HelloWorldClass extends Actor {
  constructor(config: Config) {
    super(config);
    console.log('hello world!');
  }
  printNum(): void {
    console.log('num: ', num);
  }
}
