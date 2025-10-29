import path from 'node:path';

import type { ProjectRootDir } from '../../lib/BuildPack.js';

/** @internal */
export function templatize(root: ProjectRootDir, blocksEntry: string | undefined): string {
  const template = path.join(import.meta.dirname, 'blocks.template.js');
  const blocks = blocksEntry ? path.join(root, blocksEntry) : undefined;

  // Import user code second so that it has precedence. Add `|| {}` to avoid
  // esbuild warning on apps that don't have a default export.
  return `
    import Devvit from ${JSON.stringify(template.replaceAll('\\', '/'))};
    ${blocks ? `import * as blocks from ${JSON.stringify(blocks.replaceAll('\\', '/'))};` : 'const blocks = undefined;'}
    const Actor = (blocks || {}).default ?? Devvit;
    export default Actor;
  `.trim();
}
