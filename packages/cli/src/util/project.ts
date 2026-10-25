import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import type { ProjectRootDir } from '@devvit/build-pack/lib/BuildPack.js';
import { apiPathPrefix } from '@devvit/shared-types/constants.js';
import type { Product } from '@devvit/shared-types/payments/Product.js';
import {
  type AppConfig,
  type AppPostConfig,
  type AppServerConfig,
  parseAppConfig,
} from '@devvit/shared-types/schemas/config-file.v1.js';
import path from 'path';

import {
  DEFAULT_DOTENV_PATH,
  DEVVIT_APP_NAME,
  DEVVIT_SUBREDDIT,
} from '../constants/Environment.js';
import { findUpDirContaining, isFile } from './file-util.js';
import { type DevvitPackageConfig, readPackageJSON } from './package-managers/package-util.js';

/**
 * Controls validation of generated files and uninitialized app names.
 * - Dynamic: User is building code (playtest).
 * - Static: User is not building code.
 * - Uninitialized: The app isn't initialized yet. Allows for project name '<% name %>', which is overwritten during initialization.
 */
export type BuildMode = 'Dynamic' | 'Static' | 'Uninitialized';

/** Basename of default schema v1 config. */
export const devvitV1ConfigFilename: string = 'devvit.json';

/** A logical project file. See config-file.v1.json. */
export class Project {
  /**
   * @arg root Project root directory.
   * @arg filename Project config filename.
   */
  static async new(root: string, filename: string, mode: BuildMode): Promise<Project> {
    const config = await readConfig(root, filename, mode === 'Uninitialized');
    let packageJSON;
    try {
      packageJSON = await readPackageJSON(root);
    } catch {
      // Failure is fine, it just means we don't have a config file (yet)
    }
    const missingFiles = validateConfig(config, existsSync, mode);
    if (missingFiles.length) {
      // check if package.json has a build command
      const containsBuildScript = Object.keys(packageJSON?.scripts ?? {}).some((script) =>
        script.includes('build')
      );
      let error = "Your devvit.json references files that don't exist: ";
      error += missingFiles.join(', ');
      if (containsBuildScript) {
        error += `. You may need to run your build script to fix this.`;
      }
      throw Error(error);
    }
    return new Project(root, filename, config, packageJSON?.devvit);
  }

  readonly flag: {
    watchDebounceMillis?: number | undefined;
    subreddit?: string | undefined;
  } = {};
  readonly app: { defaultPlaytestSubredditId?: string | undefined } = {};
  readonly root: ProjectRootDir;
  readonly filename: string;
  readonly #config: AppConfig;
  /** @deprecated Use the config-file.v1.json schema instead. */
  readonly #packageConfig: Readonly<DevvitPackageConfig> | undefined;

  constructor(
    root: ProjectRootDir,
    filename: string,
    config: AppConfig,
    packageConfig: Readonly<DevvitPackageConfig> | undefined
  ) {
    this.root = root;
    this.filename = filename;
    this.#config = config;
    this.#packageConfig = packageConfig;
  }

  get appConfig(): Readonly<AppConfig> {
    return this.#config;
  }

  // to-do: just expose `post`.
  get clientDir(): string | undefined {
    return this.#config.post?.dir;
  }

  // to-do: just expose `media`.
  get mediaDir(): string | undefined {
    return this.#config.media?.dir;
  }

  get name(): string {
    const trimmedEnvVar = process.env[DEVVIT_APP_NAME]?.trim();
    if (trimmedEnvVar) {
      return trimmedEnvVar;
    }

    return this.#config.name;
  }

  set name(name: string) {
    if (process.env[DEVVIT_APP_NAME]) {
      // If we had the app name set in an env var, don't overwrite the config
      process.env[DEVVIT_APP_NAME] = name;

      // If there's a `.env` file that contains the DEVVIT_APP_NAME variable, we should update it
      // there as well.
      updateEnvFileIfSettingExists(this.root, DEVVIT_APP_NAME, name);

      // Whether we touched .env or not, we don't want to overwrite the config file.
      return;
    }

    this.#config.name = name.toLowerCase();
    this.#config.json.name = this.#config.name;
    writeConfig(this.root, this.filename, this.#config);
  }

  get post(): Readonly<AppPostConfig | undefined> {
    return this.#config.post;
  }

  get server(): Readonly<AppServerConfig | undefined> {
    return this.#config.server;
  }

  // to-do: move into devvit.json.
  get watchDebounceMillis(): number {
    return this.flag.watchDebounceMillis ?? this.#packageConfig?.playtest?.debounceConfigMs ?? 100;
  }

  getSubreddit(mode: 'Dev' | 'Prod'): string | undefined {
    if (mode === 'Prod') {
      throw Error(`Getting Prod subreddits isn't supported yet.`);
    }

    const trimmedEnvVar = process.env[DEVVIT_SUBREDDIT]?.trim();
    if (trimmedEnvVar) {
      return trimmedEnvVar;
    }
    const trimmedFlag = this.flag.subreddit?.trim();
    if (trimmedFlag) {
      return trimmedFlag;
    }
    if (this.#config.dev?.subreddit) {
      return this.#config.dev.subreddit;
    }
    return this.app.defaultPlaytestSubredditId;
  }

  setSubreddit(subreddit: string, mode: 'Dev' | 'Prod') {
    if (mode === 'Prod') {
      throw Error(`Setting Prod subreddits isn't supported yet.`);
    }

    if (process.env[DEVVIT_SUBREDDIT]) {
      // If we had the subreddit set in an env var, don't overwrite the config
      process.env[DEVVIT_SUBREDDIT] = subreddit;

      // If there's a `.env` file that contains the DEVVIT_SUBREDDIT variable, we should update it
      // there as well.
      updateEnvFileIfSettingExists(this.root, DEVVIT_SUBREDDIT, subreddit);

      // Whether we touched .env or not, we don't want to overwrite the config file.
      return;
    }

    this.#config.dev ??= {};
    this.#config.dev.subreddit = subreddit;

    this.#config.json.dev ??= {};
    this.#config.json.dev.subreddit = subreddit;
    writeConfig(this.root, this.filename, this.#config);
  }

  setProducts(products: Product[]) {
    if (
      !this.#config.payments ||
      !this.#config.json.payments ||
      !('products' in this.#config.json.payments)
    ) {
      return;
    }

    this.#config.payments.products = products;
    this.#config.json.payments.products = products;
    writeConfig(this.root, this.filename, this.#config);
  }

  setEnvVariable(variableName: string, value: string): void {
    createOrUpdateEnvFile(this.root, variableName, value);
  }
}

/**
 * Searches upwards for the config filename and loads the project if found.
 *
 * @arg filename Optional config filename override (usually CLI flag).
 */
export async function newProject(
  filename: string | undefined,
  mode: BuildMode
): Promise<Project | undefined> {
  filename ||= devvitV1ConfigFilename;

  const root = await findUpDirContaining(filename);
  if (root) return await Project.new(root, filename, mode);
}

async function readConfig(
  root: string,
  filename: string,
  allowUninitializedConfig: boolean
): Promise<AppConfig> {
  const configFilename = path.join(root, filename);
  if (!configFilename.endsWith('.json'))
    throw new Error('Project config must be a JSON file with a .json extension.');
  if (!(await isFile(configFilename))) throw new Error(`${configFilename} does not exist`);

  let str;
  try {
    str = readFileSync(configFilename, 'utf8');
  } catch (err) {
    throw Error(`cannot read config ${configFilename}`, { cause: err });
  }

  return parseAppConfig(str, allowUninitializedConfig);
}

/** @internal; */
export function validateConfig(
  config: Readonly<AppConfig>,
  fileExists: (filename: string) => boolean,
  mode: BuildMode
): string[] {
  const missingFiles = [];

  if (config.blocks && !fileExists(config.blocks.entry))
    missingFiles.push(`\`config.blocks.entry\` (${config.blocks.entry})`);

  if (config.media && !fileExists(config.media.dir))
    missingFiles.push(`\`config.media.dir\` (${config.media.dir})`);

  if (config.post) {
    if (!fileExists(config.post.dir) && mode === 'Static')
      missingFiles.push(`\`config.post.dir\` (${config.post.dir})`);

    for (const [name, entrypoint] of Object.entries(config.post.entrypoints)) {
      if (entrypoint.entry.startsWith(apiPathPrefix) || mode === 'Dynamic') {
        // URL path or user is rebuilding regularly during playtest.
      } else {
        const dir = path.resolve(config.post.dir);
        const entry = path.resolve(dir, entrypoint.entry);
        if (!fileExists(entry)) {
          missingFiles.push(`\`config.post.entrypoints.${name}.entry\` (${entrypoint.entry})`);
        }
      }
    }
  }

  const serverEntry = config.server ? path.join(config.server.dir, config.server.entry) : undefined;
  if (serverEntry && !fileExists(serverEntry) && mode === 'Static')
    missingFiles.push(`\`config.server\` (${serverEntry})`);

  return missingFiles;
}

function writeConfig(projectPath: string, configFile: string, config: Readonly<AppConfig>): void {
  writeFileSync(path.join(projectPath, configFile), JSON.stringify(config.json, undefined, 2));
}

function updateEnvFileIfSettingExists(
  projectPath: string,
  variableName: string,
  value: string
): void {
  const envFilePath = path.join(projectPath, DEFAULT_DOTENV_PATH);
  if (existsSync(envFilePath)) {
    const envContent = readFileSync(envFilePath, 'utf8');
    const updatedEnvContent = doEnvFileReplacement(envContent, variableName, value);
    writeFileSync(envFilePath, updatedEnvContent);
  }
}

function updateEnvFile(projectPath: string, variableName: string, value: string): void {
  const envFilePath = path.join(projectPath, DEFAULT_DOTENV_PATH);
  if (existsSync(envFilePath)) {
    const envContent = readFileSync(envFilePath, 'utf8');
    const updatedEnvContent = doEnvFileReplacement(envContent, variableName, value);
    if (envContent !== updatedEnvContent) {
      writeFileSync(envFilePath, updatedEnvContent);
      return;
    }
    // Variable doesn't exist, so append it
    let newLine = `${variableName}=${value}\n`;
    if (!envContent.endsWith('\n') && envContent.length > 0) {
      newLine = '\n' + newLine;
    }
    writeFileSync(envFilePath, envContent + newLine);
  }
}

function createOrUpdateEnvFile(projectPath: string, variableName: string, value: string): void {
  const envFilePath = path.join(projectPath, DEFAULT_DOTENV_PATH);
  if (!existsSync(envFilePath)) {
    // Make a blank
    writeFileSync(envFilePath, '');
  }
  // Then just call the updater
  updateEnvFile(projectPath, variableName, value);
}

export function doEnvFileReplacement(
  envContent: string,
  variableName: string,
  value: string
): string {
  // eslint-disable-next-line security/detect-non-literal-regexp
  const regex = new RegExp(`^${variableName}=.*$`, 'm');
  return envContent.replace(regex, `${variableName}=${value}`);
}

export function isRunningInAppDirectory(): boolean {
  return existsSync(path.join(process.cwd(), devvitV1ConfigFilename));
}
