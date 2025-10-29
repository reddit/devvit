import { test } from 'vitest';

import { templatize } from './templatizer.js';

test('no blocks entry', () => {
  const template = normalizeTemplate(templatize('root', undefined));
  expect(template).toMatchInlineSnapshot(`
    "import Devvit from "/packages/build-pack/src/esbuild/templatizer/blocks.template.js";
        const blocks = undefined;
        const Actor = (blocks || {}).default ?? Devvit;
        export default Actor;"
  `);
});

test('blocks entry', () => {
  const template = normalizeTemplate(
    templatize('root', `${import.meta.dirname}/../__tests__/test-actors/hello-world-api/main.ts`)
  );
  expect(template).toMatchInlineSnapshot(`
    "import Devvit from "/packages/build-pack/src/esbuild/templatizer/blocks.template.js";
        import * as blocks from "root/packages/build-pack/src/esbuild/__tests__/test-actors/hello-world-api/main.ts";
        const Actor = (blocks || {}).default ?? Devvit;
        export default Actor;"
  `);
});

test('blocks no export or import', () => {
  const template = normalizeTemplate(
    templatize(
      'root',
      `${import.meta.dirname}/../__tests__/test-actors/hello-world-nothing/main.ts`
    )
  );
  expect(template).toMatchInlineSnapshot(`
    "import Devvit from "/packages/build-pack/src/esbuild/templatizer/blocks.template.js";
        import * as blocks from "root/packages/build-pack/src/esbuild/__tests__/test-actors/hello-world-nothing/main.ts";
        const Actor = (blocks || {}).default ?? Devvit;
        export default Actor;"
  `);
});

test('Windows', () => {
  const template = normalizeTemplate(templatize('C:\\Users\\spez\\foo', `src\\main.ts`));
  expect(template).toMatchInlineSnapshot(`
    "import Devvit from "/packages/build-pack/src/esbuild/templatizer/blocks.template.js";
        import * as blocks from "C:/Users/spez/foo/src/main.ts";
        const Actor = (blocks || {}).default ?? Devvit;
        export default Actor;"
  `);
});

function normalizeTemplate(template: string): string {
  return template.replaceAll(/\/.*\/packages/g, '/packages');
}
