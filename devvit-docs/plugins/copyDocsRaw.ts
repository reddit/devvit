import { LoadContext, Plugin } from '@docusaurus/types';
import { Dirent } from 'fs';
import fs from 'fs/promises';
import { glob } from 'glob';
import path from 'path';

/**
 * Docusaurus plugin that copies every .md/.mdx file under the docs folder
 * into the final build so they are accessible as raw markdown (e.g.
 * /docs/quickstart.md).
 */
export default function copyDocsRawPlugin(
  context: LoadContext,
  { ignore = [] }: { ignore?: string[]; docsBaseUrl?: string } = {}
): Plugin {
  return {
    name: 'copy-docs-raw',

    /**
     * Runs after the static site has been built.
     * @param {{outDir: string}} context
     */
    async postBuild({ outDir }) {
      // Source docs directory (adjust if your docs live elsewhere)
      const docsDir = path.resolve(__dirname, '..', 'docs');
      const files = await glob(['**/*.md', '**/*.mdx'], {
        cwd: docsDir,
        ignore,
      });

      await Promise.all(
        files.map(async (relPath) => {
          const src = path.join(docsDir, relPath);

          // Place the raw markdown file alongside its HTML counterpart so that
          // users can retrieve it by simply appending ".md" to the URL
          // (e.g. /dev_guide -> /dev_guide.md). We therefore copy the source
          // file to build/<slug>.md instead of build/<slug>/index.md.
          const { dir: relDir, name: fileName } = path.parse(relPath);
          const destDir = path.join(outDir, relDir);
          const dest = path.join(destDir, `${fileName}.md`);

          await fs.mkdir(destDir, { recursive: true });
          await fs.copyFile(src, dest);
        })
      );

      /**
       * Handle versioned docs (e.g. versioned_docs/version-0.10/...).
       * We copy these so that the raw markdown lives alongside the generated
       * HTML, i.e. build/0.10/<doc>/index.md. This makes it possible to append
       * ".md" to any docs URL (including versioned ones) and retrieve the raw
       * markdown file.
       */

      const versionedDocsRoot = path.resolve(__dirname, '..', 'versioned_docs');

      // It is possible a project does not use versioned docs – skip gracefully
      // if the directory is missing.
      let versionDirEntries: Dirent[] = [];
      try {
        versionDirEntries = await fs.readdir(versionedDocsRoot, { withFileTypes: true });
      } catch (err) {
        if (err.code !== 'ENOENT') throw err; // Unexpected error
      }

      for (const dirent of versionDirEntries) {
        if (!dirent.isDirectory()) continue;
        if (!dirent.name.startsWith('version-')) continue;

        const versionLabel = dirent.name.replace(/^version-/, ''); // "0.10", "0.11", etc.
        const sourceDir = path.join(versionedDocsRoot, dirent.name);

        const versionFiles = await glob(['**/*.md', '**/*.mdx'], {
          cwd: sourceDir,
          ignore,
        });

        await Promise.all(
          versionFiles.map(async (relPath) => {
            const src = path.join(sourceDir, relPath);

            // Copy versioned docs so that /<version>/<slug>.md is accessible
            const { dir: relDir, name: fileName } = path.parse(relPath);
            const destDir = path.join(outDir, versionLabel, relDir);
            const dest = path.join(destDir, `${fileName}.md`);

            await fs.mkdir(destDir, { recursive: true });
            await fs.copyFile(src, dest);
          })
        );
      }
    },
  };
}
