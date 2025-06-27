/**
 * `ClassicAppConfig` is the old config being phased out for "Webbit".
 * "v1" / `AppConfig` is the new config backed by config-file.v1.json.
 * `DevvitConfig` is either of these.
 *
 * to-do: delete this comment when ClassicAppConfig is deleted.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import type { ProjectRootDir } from '@devvit/build-pack/lib/BuildPack.js';
import type { JSONValue } from '@devvit/shared-types/json.js';
import {
  apiPathPrefix,
  type AppConfig,
  type AppPermissionConfig,
  type AppPostConfig,
  type AppServerConfig,
  parseAppConfig,
} from '@devvit/shared-types/schemas/config-file.v1.js';
import path from 'path';

import { findUpDirContaining, isFile } from './file-util.js';
import { dumpJsonToYaml, readYamlToJson } from './files.js';
import { type DevvitPackageConfig, readPackageJSON } from './package-managers/package-util.js';

/**
 * Whether the user may be building code while evaluating the project config
 * (playtest). Used as a hueristic on when to print which errors.
 */
export type BuildMode = 'Dynamic' | 'Static';

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
    const config = await readConfig(root, filename);
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
    return isAppConfig(this.#config) ? this.#config.post?.client.dir : 'webroot';
  }

  // to-do: just return media once classic is removed.
  get mediaDir(): string | undefined {
    return isAppConfig(this.#config) ? this.#config.media?.dir : 'assets';
  }

  get name(): string {
    return this.#config.name;
  }

  set name(name: string) {
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

    const trimmedEnvVar = process.env?.DEVVIT_DEV_SUBREDDIT?.trim();
    if (trimmedEnvVar) {
      return process.env.DEVVIT_DEV_SUBREDDIT;
    }
    const trimmedFlag = this.flag.subreddit?.trim();
    if (trimmedFlag) {
      return this.flag.subreddit;
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

    if (!isAppConfig(this.#config)) return;

    this.#config.dev ??= {};
    this.#config.dev.subreddit = subreddit;

    this.#config.json.dev ??= {};
    this.#config.json.dev.subreddit = subreddit;
    writeConfig(this.root, this.filename, this.#config);
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
export function parseClassicConfig(json: JSONValue): DevvitConfig {
  if (json == null || typeof json !== 'object' || Array.isArray(json))
    throw Error(`${devvitClassicConfigFilename} must be an object \`{"name": "foo", ...}\`.`);

  if (typeof json.name !== 'string')
    throw Error(`${devvitClassicConfigFilename} must have \`name\` property.`);

  // Include original data in case it's a superset.
  return { ...json, name: json.name.toLowerCase() };
}

async function readConfig(root: string, filename: string): Promise<DevvitConfig> {
  const configFilename = path.join(root, filename);
  if (!(await isFile(configFilename))) throw new Error(`${configFilename} does not exist`);

  if (configFilename.endsWith('.json')) {
    let str;
    try {
      str = readFileSync(configFilename, 'utf8');
    } catch (err) {
      throw Error(`cannot read config ${configFilename}`, { cause: err });
    }

    return parseAppConfig(str);
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
    if (!fileExists(config.post.client.dir) && mode === 'Static')
      missingFiles.push(`\`config.post.client.dir\` (${config.post.client.dir})`);

    if (config.post.client.entry.startsWith(apiPathPrefix) || mode === 'Dynamic') {
      // URL path or user is rebuilding regularly during playtest.
    } else if (!fileExists(config.post.client.entry))
      missingFiles.push(`\`config.post.client.entry\` (${config.post.client.entry})`);
    else {
      const dir = path.resolve(config.post.client.dir);
      const entry = path.resolve(config.post.client.entry);
      if (!entry.startsWith(dir))
        missingFiles.push(
          `\`config.post.client.entry\` (${config.post.client.entry}) must exist within \`config.post.client.dir\` (${config.post.client.dir})`
        );
    }
  }

  if (config.server && !fileExists(config.server.entry) && mode === 'Static')
    missingFiles.push(`\`config.server.entry\` (${config.server.entry})`);

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
