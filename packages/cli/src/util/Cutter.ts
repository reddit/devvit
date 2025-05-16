import { exec as _exec, execFile as _execFile } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';

import { fileTypeFromFile } from 'file-type';
import Mustache from 'mustache';
const exec = util.promisify(_exec);

const RAW_FILE_MIME_TYPES: string[] = [
  'image/',
  'video/',
  'application/',
  'video/',
  'audio/',
  'font/',
  'model/',
];

function m(template: string, mustacheContext: unknown): string {
  return Mustache.render(template, mustacheContext);
}

/** Render a template directly to the filesystem. */
export default class Cutter {
  source: string;
  constructor(source: string) {
    this.source = source;
  }

  async cut(target: string, mustacheContext: unknown): Promise<void> {
    await fsp.mkdir(target, { recursive: true });
    await this.#cut(this.source, target, mustacheContext);

    const cmd = path.join(target, 'init.sh');
    if (fs.existsSync(cmd)) {
      const { stderr } = await util.promisify(_execFile)('bash', [cmd]);
      if (stderr.length) {
        throw new Error(stderr);
      }
      fs.rmSync(cmd);
    }
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
