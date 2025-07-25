import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { fileTypeFromFile } from 'file-type';
import JSZip from 'jszip';
import Mustache from 'mustache';

const RAW_FILE_MIME_TYPES: string[] = [
  'image/',
  'video/',
  'application/',
  'video/',
  'audio/',
  'font/',
  'model/',
];

// Use custom Mustache delimiters that won't conflict with JSX/TSX curly braces.
const MUSTACHE_TAGS: [string, string] = ['<%', '%>'];

function m(template: string, mustacheContext: unknown): string {
  return Mustache.render(template, mustacheContext, undefined, { tags: MUSTACHE_TAGS });
}

/** Render a template directly to the filesystem. */
export default class Cutter {
  readonly sourceUrl: string;

  constructor(sourceUrl: string) {
    this.sourceUrl = sourceUrl;
  }

  async cut(target: string, mustacheContext: unknown): Promise<void> {
    await fsp.mkdir(target, { recursive: true });
    console.log('Fetching and extracting the template...');
    const tmpdir = await this.#fetchAndExtract(this.sourceUrl);
    console.log('Cutting the template to the target directory...');
    await this.#cut(tmpdir, target, mustacheContext);
  }

  async #fetchAndExtract(sourceUrl: string): Promise<string> {
    const tmpdir = await fsp.mkdtemp(path.join(os.tmpdir(), 'devvit-cutter-'));

    // Fetch the source URL into a buffer
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch template from ${sourceUrl}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();

    // Extract the buffer to the temporary directory using jszip
    const zip = await JSZip.loadAsync(buffer);
    await Promise.all(
      Object.values(zip.files).map(async (file) => {
        const filePath = path.join(tmpdir, file.name);

        // Make sure the directory exists (whether this entry is a file or dir)
        // Some zip archives (e.g., those generated by GitHub) may omit explicit directory
        // entries for nested paths, so we need to create them ourselves.
        const dirToCreate = file.dir ? filePath : path.dirname(filePath);
        await fsp.mkdir(dirToCreate, { recursive: true });

        // If it’s a file, write its content
        if (!file.dir) {
          const content = await file.async('nodebuffer');
          await fsp.writeFile(filePath, content);
        }
      })
    );

    // There will be a subdirectory in the temporary directory; we want to return the path to that subdirectory.
    const entries = await fsp.readdir(tmpdir, { withFileTypes: true });
    if (entries.length !== 1 || !entries[0].isDirectory()) {
      throw new Error(
        `Expected a single directory in ${tmpdir}, found: ${entries.map((e) => e.name).join(', ')}`
      );
    }
    // Return the path to the extracted directory
    return path.join(tmpdir, entries[0].name);
  }

  async #cut(source: string, target: string, mustacheContext: unknown): Promise<void> {
    for await (const entry of await fsp.opendir(source)) {
      const newName = m(entry.name, mustacheContext);
      const newTarget = path.join(target, newName);
      const newSource = path.join(source, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') {
          continue;
        }

        await fsp.mkdir(newTarget);
        await this.#cut(newSource, newTarget, mustacheContext);
      } else if (entry.isFile()) {
        // skip template config since it's only needed for CLI
        if (entry.name === 'template-config.json') {
          continue;
        }
        const type = await fileTypeFromFile(newSource);
        // If we could determine the file type, and it starts with a raw mime type indicator
        if (type && RAW_FILE_MIME_TYPES.some((mime) => type.mime.startsWith(mime))) {
          // Copy the file directly, no Mustache
          await fsp.copyFile(newSource, newTarget);
          continue;
        }

        // Else, run Mustache against the file contents & write the output
        const content = await fsp.readFile(newSource, 'utf8');
        const newContent = m(content, mustacheContext);
        await fsp.writeFile(newTarget, newContent);
      } else {
        throw new Error(`Unknown file type: ${entry.name}`);
      }
    }
  }
}
