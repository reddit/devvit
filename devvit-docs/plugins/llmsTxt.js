/**
 * Inspired by Prisma: https://github.com/prisma/docs/pull/6645
 *
 * Docusaurus is currently making a first party plugin:
 * https://github.com/facebook/docusaurus/issues/10899
 *
 * This plugin is meant to hold us until that is released.
 */

const path = require('path');
const fs = require('fs');
const { glob } = require('glob');

module.exports = async function pluginLlmsTxt(context, options = {}) {
  return {
    name: 'llms-txt-plugin',
    loadContent: async () => {
      const { siteDir } = context;
      const contentDir = path.join(siteDir, 'docs');

      // Discover markdown and mdx files using `glob` for ignore support.
      const files = await glob(['**/*.md', '**/*.mdx'], {
        cwd: contentDir,
        ignore: options.ignore ?? [],
      });

      const allMd = await Promise.all(
        files.map(async (relPath) => {
          const absPath = path.join(contentDir, relPath);
          return fs.promises.readFile(absPath, 'utf8');
        })
      );

      // Build a set of doc slugs relative to docs/ without file extension so
      // we can later determine whether a route corresponds to a file that
      // actually lives under the docs/ directory.
      const docsFileSet = new Set(files.map((relPath) => relPath.replace(/\.mdx?$/, '')));

      return { allMd, docsFileSet: Array.from(docsFileSet) };
    },
    postBuild: async ({ content, routes, outDir }) => {
      const { allMd, docsFileSet } = content;
      const docsFileSlugSet = new Set(docsFileSet);

      // Write concatenated MDX content
      const concatenatedPath = path.join(outDir, 'llms-full.txt');
      await fs.promises.writeFile(concatenatedPath, allMd.join('\n\n---\n\n'));

      // Collect docs metadata from EVERY docs plugin instance by traversing the
      // route tree and gathering all nodes that expose `props.version.docs`.
      const collectDocsRoots = (routeArray, acc) => {
        for (const route of routeArray) {
          if (route?.props?.version?.docs) {
            acc.push(route);
          }
          if (route.routes) {
            collectDocsRoots(route.routes, acc);
          }
        }
      };

      const docsRoots = [];
      collectDocsRoots(routes, docsRoots);

      // Build a map to deduplicate by permalink/path.
      const docsMap = new Map();

      const docsBaseUrl = options.docsBaseUrl || 'https://developers.reddit.com/docs';

      for (const root of docsRoots) {
        const docsObj = root.props.version.docs;
        for (const [docPath, record] of Object.entries(docsObj)) {
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

      return docsMap;
    },
  };
};
