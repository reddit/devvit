/**
 * Regenerates the versioned docs for the current version of the project.
 * @packageDocumentation
 */

import { exec as _exec, spawn as _spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as rl from 'node:readline';
import { promisify } from 'node:util';

const exec = promisify(_exec);

const __dirname = new URL('.', import.meta.url).pathname;

/** @return {Promise<void>} */
async function main() {
  const newVersion = await readLernaVersion();

  // Generate versioned docs
  // Build repo - this is necessary so that the CLI docs (which are generated
  // from the build output) are accurate.
  await execMust`yarn build`;

  // cd to docs dir
  process.chdir(path.join(__dirname, '../../devvit-docs'));

  // delete previous version of these docs, if it exists - we'll re-generate it
  const newVersionMinorOnly = newVersion.split('.').slice(0, 2).join('.');
  const versionedDocsDir = path.join('.', 'versioned_docs', `version-${newVersionMinorOnly}`);
  if (existsSync(versionedDocsDir)) {
    await rm(versionedDocsDir, { recursive: true, force: true });

    // Also delete the sidebar
    await rm(path.join('versioned_sidebars', `version-${newVersionMinorOnly}-sidebars.json`));

    // Also, convince docusaurus that this version doesn't exist
    const versionsJSONPath = 'versions.json';
    const versionsArray = JSON.parse(await readFile(versionsJSONPath, 'utf8'));
    const filteredVersionsArray = versionsArray.filter((v) => v !== newVersionMinorOnly);
    await writeFile(versionsJSONPath, JSON.stringify(filteredVersionsArray));

    // And in the config
    await setDocusaurusConfigLastVersion(filteredVersionsArray[0]);
  }

  // actually generate versioned docs
  await execMust`yarn docusaurus docs:version ${newVersionMinorOnly}`;

  // Update the config to point to the new version
  await setDocusaurusConfigLastVersion(newVersionMinorOnly);

  // cd back to root
  process.chdir('..');

  // git stage and commit
  await gitStageAndCommit(`(Chore): Generating versioned docs for 'v${newVersion}'`);
}

/**
 * Executes a shell command. Exits the entire script's process if the command fails.
 * Invoked as a template literal, i.e.
 *     await execMust`git add ${filename}`;
 * @return {Promise<void>} Resolves when the command has completed.
 */
async function execMust(strs, ...vals) {
  let cmd = '';
  for (const [i, str] of strs.entries()) cmd += `${str}${i in vals ? vals[i] : ''}`;

  const [exe, ...args] = cmd.trim().split(/\s+/);
  const child = _spawn(exe, args, {
    shell: true,
    stdio: 'inherit',
  });
  await new Promise((resolve) => {
    child.on('exit', (exitCode) => {
      if (exitCode !== 0) {
        process.exit(exitCode ?? 0);
      } else {
        resolve();
      }
    });
  });
}

/**
 * @arg {string} question
 * @return {Promise<boolean>}
 */
async function promptYesNo(question) {
  const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(question);

  return new Promise((resolve) => {
    readline.question('Are you sure?: [y|n] ', (answer) => {
      readline.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/** @return {Promise<string>} */
async function readLernaVersion() {
  const lernaFilename = path.join(__dirname, '../../lerna.json');
  const lernaConfig = JSON.parse(await readFile(lernaFilename, 'utf8'));
  return lernaConfig.version;
}

/**
 * Stage all changes, confirm that it looks right, and commit them.
 * @param commitMessage The commit message to use
 * @return {Promise<void>}
 */
async function gitStageAndCommit(commitMessage) {
  await execMust`git add -A`;
  await execMust`git status`;
  const confirmed = await promptYesNo(
    'Confirm that the files staged for version bump commit is correct.'
  );
  if (!confirmed) {
    console.log('Reverting staged changes...');
    await exec('git reset && git checkout');
    console.log('Done.');
    process.exit(1);
  }
  await execMust`git commit -m "${commitMessage}"`;
}

/**
 * Sets the lastVersion in the docusaurus config to the given version.
 * @param version Version to set it to.
 * @return {Promise<void>}
 */
async function setDocusaurusConfigLastVersion(version) {
  const docusaurusConfigPath = 'docusaurus.config.js';
  const docusaurusConfig = await readFile(docusaurusConfigPath, 'utf8');
  const newConfig = docusaurusConfig.replaceAll(
    /lastVersion: '[^']*'/g,
    `lastVersion: '${version}'`
  );
  await writeFile(docusaurusConfigPath, newConfig);
}

void main();
