// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Actor } = require('@devvit/shared-types/Actor.js');
import type { Config } from '@devvit/shared-types/Config.js' with { 'resolution-mode': 'import' };

module.exports = {
  default: class extends Actor {
    constructor(config: Config) {
      super(config);
    }
  },
};
