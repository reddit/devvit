import type { LoadContext, Plugin } from '@docusaurus/types';
import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

// Internal typings for the docs metadata exposed by Docusaurus routes. We only
// care about the pieces that are accessed later in this file—namely `title`
// and `description`.
interface DocRecord {
  title: string;
  description?: string;
}

type DocsObject = Record<string, DocRecord>;

// Route type with just the fields we need (`props.version.docs`) to keep the
// implementation type‐safe without depending on private Docusaurus types.
interface DocsRoute {
  props?: {
    version?: {
      docs?: DocsObject;
    };
  };
  routes?: DocsRoute[];
}

/**
 * Inspired by Prisma: https://github.com/prisma/docs/pull/6645
 *
 * Docusaurus is currently making a first party plugin:
 * https://github.com/facebook/docusaurus/issues/10899
 *
 * This plugin is meant to hold us until that is released.
 *
 * Produces a `llms.txt` file in the build directory that contains a list of
 * all the docs pages, their titles, and descriptions. Additionally, it
 * produces a `llms-full.txt` file that contains the full content of all the
 * docs pages.
 */

export default async function pluginLlmsTxt(
  context: LoadContext,
  {
    ignore = [],
    docsBaseUrl = 'https://developers.reddit.com/docs',
  }: { ignore?: string[]; docsBaseUrl?: string } = {}
): Promise<
  Plugin<{
    allMd: string[];
    docsFileSet: string[];
  }>
> {
  return {
    name: 'llms-txt-plugin',
    loadContent: async () => {
      const { siteDir } = context;
      const contentDir = path.join(siteDir, 'docs');

      // Discover markdown and mdx files using `glob` for ignore support.
      const files = await glob(['**/*.md', '**/*.mdx'], {
        cwd: contentDir,
        ignore,
      });

      const allMd = await Promise.all(
        files.map(async (relPath) => {
          const absPath = path.join(contentDir, relPath);
          const original = await fs.promises.readFile(absPath, 'utf8');
          // Replace long `play#pen` URLs which dramatically inflate token counts.
          // Example to match: https://developers.reddit.com/play#pen/<anything>
          return original.replace(
            /https:\/\/developers\.reddit\.com\/play#pen\/[^\s)]+/g,
            'https://developers.reddit.com/play/redactedfromllmstxt'
          );
        })
      );

      // Build a set of doc slugs relative to docs/ without file extension so
      // we can later determine whether a route corresponds to a file that
      // actually lives under the docs/ directory.
      const docsFileSet = new Set(files.map((relPath) => relPath.replace(/\.mdx?$/, '')));

      return { allMd, docsFileSet: Array.from(docsFileSet) };
    },
    postBuild: async (props) => {
      // The `routes` array is not part of the published `PostBuildProps` type
      // today, but Docusaurus does pass it at runtime. Accepting a loosely
      // typed `props` parameter lets us keep type-safety internally without
      // fighting upstream types.

      const { content, routes, outDir } = props;

      const { allMd, docsFileSet } = content;
      const docsFileSlugSet = new Set(docsFileSet);

      // Write concatenated MDX content
      const concatenatedPath = path.join(outDir, 'llms-full.txt');
      await fs.promises.writeFile(concatenatedPath, allMd.join('\n\n---\n\n'));

      // Collect docs metadata from EVERY docs plugin instance by traversing the
      // route tree and gathering all nodes that expose `props.version.docs`.
      const collectDocsRoots = (routeArray: DocsRoute[], acc: DocsRoute[]): void => {
        for (const route of routeArray) {
          if (route?.props?.version?.docs) {
            acc.push(route);
          }
          if (route.routes) {
            collectDocsRoots(route.routes, acc);
          }
        }
      };

      const docsRoots: DocsRoute[] = [];
      collectDocsRoots(routes, docsRoots);

      // Build a map to deduplicate by permalink/path.
      const docsMap = new Map();

      for (const root of docsRoots) {
        const docsObj = (root.props?.version?.docs ?? {}) as DocsObject;
        for (const [docPath, record] of Object.entries(docsObj) as [string, DocRecord][]) {
          // Include only routes whose slug corresponds to a file that lives in
          // the docs/ directory (based on the earlier globby scan).
          const cleaned = docPath
            .replace(/^\/+/, '')
            .replace(/\.mdx?$/, '')
            .replace(/\/index$/, 'index');

          if (!docsFileSlugSet.has(cleaned)) {
            continue;
          }

          const description = record.description ?? '';
          // Build absolute link to raw Markdown file.
          const relativeFilePath = `${cleaned}.md`;

          const href = `${docsBaseUrl}/${relativeFilePath}`;

          docsMap.set(docPath, `- [${record.title}](${href}): ${description}`.trimEnd());
        }
      }

      const docsRecords = Array.from(docsMap.values());

      // Build up llms.txt file. If no docsRecords were found, at least create
      // the file with a header so users know the plugin ran.
      const llmsTxt = `# ${context.siteConfig.title}\n\n## Docs\n\n${docsRecords.join('\n')}`;

      // Write llms.txt file
      const llmsTxtPath = path.join(outDir, 'llms.txt');

      await fs.promises.writeFile(llmsTxtPath, llmsTxt, 'utf8');
    },
  };
}
