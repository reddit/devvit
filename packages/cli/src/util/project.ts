/**
 * `ClassicAppConfig` is the old config being phased out for "Webbit".
 * "v1" / `AppConfig` is the new config backed by config-file.v1.json.
 * `DevvitConfig` is either of these.
 *
 * to-do: delete this comment when ClassicAppConfig is deleted.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import type { ProjectRootDir } from '@devvit/build-pack/lib/BuildPack.js';
import { apiPathPrefix } from '@devvit/shared-types/constants.js';
import type { JsonValue } from '@devvit/shared-types/json.js';
import type { Product } from '@devvit/shared-types/payments/Product.js';
import {
  type AppConfig,
  type AppPermissionConfig,
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
import { dumpJsonToYaml, readYamlToJson } from './files.js';
import { type DevvitPackageConfig, readPackageJSON } from './package-managers/package-util.js';

/**
 * Whether the user may be building code while evaluating the project config.
 * Used as a hueristic on when to print which errors.
 * - Dynamic: User is building code (playtest).
 * - Static: User is not building code.
 * - Uninitialized: The app isn't initialized yet. Allows for project name '<% name %>', which is overwritten during initialization.
 */
export type BuildMode = 'Dynamic' | 'Static' | 'Uninitialized';

/** @deprecated Use AppConfig. */
export type ClassicAppConfig = {
  /** Lowercase app name and Community app slug. */
  name: string;
};
export type DevvitConfig = ClassicAppConfig | AppConfig;

/** Basename of default classic config. */
export const devvitClassicConfigFilename: string = 'devvit.yaml';
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
    if (isAppConfig(config)) {
      const missingFiles = validateConfig(config, existsSync, mode);
      // check if package.json has a build command
      if (missingFiles.length) {
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
  readonly #config: DevvitConfig;
  /** @deprecated Use the config-file.v1.json schema instead. */
  readonly #packageConfig: Readonly<DevvitPackageConfig> | undefined;

  constructor(
    root: ProjectRootDir,
    filename: string,
    config: DevvitConfig,
    packageConfig: Readonly<DevvitPackageConfig> | undefined
  ) {
    this.root = root;
    this.filename = filename;
    this.#config = config;
    this.#packageConfig = packageConfig;
  }

  get appConfig(): Readonly<AppConfig> | undefined {
    return isAppConfig(this.#config) ? this.#config : undefined;
  }

  // to-do: just return post once classic is removed.
  get clientDir(): string | undefined {
    return isAppConfig(this.#config) ? this.#config.post?.dir : 'webroot';
  }

  // to-do: just return media once classic is removed.
  get mediaDir(): string | undefined {
    return isAppConfig(this.#config) ? this.#config.media?.dir : 'assets';
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
    if (isAppConfig(this.#config)) this.#config.json.name = this.#config.name;
    writeConfig(this.root, this.filename, this.#config);
  }

  get permissions(): Readonly<AppPermissionConfig> | undefined {
    return isAppConfig(this.#config) ? this.#config.permissions : undefined;
  }

  get post(): Readonly<AppPostConfig | undefined> {
    return isAppConfig(this.#config) ? this.#config.post : undefined;
  }

  get server(): Readonly<AppServerConfig | undefined> {
    return isAppConfig(this.#config) ? this.#config.server : undefined;
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
    if (isAppConfig(this.#config) && this.#config.dev?.subreddit) {
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

    if (!isAppConfig(this.#config)) return;

    this.#config.dev ??= {};
    this.#config.dev.subreddit = subreddit;

    this.#config.json.dev ??= {};
    this.#config.json.dev.subreddit = subreddit;
    writeConfig(this.root, this.filename, this.#config);
  }

  setProducts(products: Product[]) {
    if (
      !isAppConfig(this.#config) ||
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
 * Searches for dir containing the config filename. If found, returns a cached
 * config.
 *
 * @arg filename Optional config filename override (usually CLI flag).
 */
export async function newProject(
  filename: string | undefined,
  mode: BuildMode
): Promise<Project | undefined> {
  filename ||= (await findUpDirContaining(devvitV1ConfigFilename))
    ? devvitV1ConfigFilename
    : devvitClassicConfigFilename;

  const root = await findUpDirContaining(filename);
  if (root) return await Project.new(root, filename, mode);
}

/** @internal */
export function isAppConfig(config: Readonly<DevvitConfig>): config is AppConfig {
  return 'schema' in config && !!config.schema;
}

/** @internal */
export function parseClassicConfig(json: JsonValue): DevvitConfig {
  if (json == null || typeof json !== 'object' || Array.isArray(json))
    throw Error(`${devvitClassicConfigFilename} must be an object \`{"name": "foo", ...}\`.`);

  if (typeof json.name !== 'string')
    throw Error(`${devvitClassicConfigFilename} must have \`name\` property.`);

  // Include original data in case it's a superset.
  return { ...json, name: json.name.toLowerCase() };
}

async function readConfig(
  root: string,
  filename: string,
  allowUninitializedConfig: boolean
): Promise<DevvitConfig> {
  const configFilename = path.join(root, filename);
  if (!(await isFile(configFilename))) throw new Error(`${configFilename} does not exist`);

  if (configFilename.endsWith('.json')) {
    let str;
    try {
      str = readFileSync(configFilename, 'utf8');
    } catch (err) {
      throw Error(`cannot read config ${configFilename}`, { cause: err });
    }

    return parseAppConfig(str, allowUninitializedConfig);
  }

  return parseClassicConfig(await readYamlToJson(configFilename));
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

function writeConfig(
  projectPath: string,
  configFile: string,
  config: Readonly<DevvitConfig>
): void {
  writeFileSync(
    path.join(projectPath, configFile),
    isAppConfig(config) ? JSON.stringify(config.json, undefined, 2) : dumpJsonToYaml(config)
  );
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
  return (
    existsSync(path.join(process.cwd(), devvitClassicConfigFilename)) ||
    existsSync(path.join(process.cwd(), devvitV1ConfigFilename))
  );
}
