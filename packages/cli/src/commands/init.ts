import { exec as _exec } from 'node:child_process';
import fs, { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import querystring from 'node:querystring';
import util from 'node:util';

import { InitAppResponse } from '@devvit/protos/types/devvit/cli/init.js';
import { isDevvitDependency } from '@devvit/shared-types/isDevvitDependency.js';
import { UNINITIALIZED_APP_NAME } from '@devvit/shared-types/schemas/constants.js';
import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import git from 'isomorphic-git';
import open from 'open';
import semver from 'semver';

import { localCodeServer } from '../lib/auth/local-code-server.js';
import { StoredToken } from '../lib/auth/StoredToken.js';
import { getAccessToken, getOAuthSvc } from '../util/auth.js';
import { DevvitCommand } from '../util/commands/DevvitCommand.js';
import { DEVVIT_PORTAL_URL } from '../util/config.js';
import Cutter from '../util/Cutter.js';
import { readLine } from '../util/input-util.js';
import { getPlatformFromEnvironment, isWebContainer } from '../util/platform-util.js';
import { isRunningInAppDirectory } from '../util/project.js';
import { ProjectTemplateResolver } from '../util/template-resolvers/ProjectTemplateResolver.js';
import { logInBox } from '../util/ui.js';

const exec = util.promisify(_exec);

const templateResolver = new ProjectTemplateResolver();
const require = createRequire(import.meta.url);
// eslint-disable-next-line security/detect-non-literal-require
const cliPackageJSON = require(require.resolve(`@devvit/cli/package.json`));
const CLI_VERSION = semver.parse(cliPackageJSON.version)!;

type InitAppFlags = {
  template: string | undefined;
};

export default class Init extends DevvitCommand {
  static override aliases: string[] = ['new'];
  static override description = 'Initialize a new app';

  static override examples = ['$ devvit init', '$ devvit init <code>'];

  static override args = {
    code: Args.string({
      description:
        'A code given to you by Reddit to initialize your app. If no code is entered, you will be redirected to the web to create your app and receive a code.',
      required: false,
    }),
  } as const;

  static override flags = {
    template: Flags.string({
      description: 'Optional template name to skip template selection in the wizard.',
      required: false,
    }),
    force: Flags.boolean({
      description:
        'Force initialization even if the current directory is already a Devvit app. This will create a new devvit app.',
      default: false,
      required: false,
    }),
  } as const;

  #initAppParams: InitAppResponse | undefined;

  #initAppFlags: InitAppFlags | undefined;

  get #projectPath(): string {
    if (!this.#initAppParams?.appName) {
      this.error('The project was not properly initialized. Aborting');
    }
    // If we were running inside a project, we use the current working directory
    if (isRunningInAppDirectory()) {
      return process.cwd();
    }
    // Else, we're using the app slug as the dir name
    return path.join(process.cwd(), this.#initAppParams.appName);
  }

  override async init(): Promise<void> {
    await super.init('Uninitialized');
  }

  override async run(): Promise<void> {
    // TODO: DX-9807 - 0. Fire the init telemetry event

    const { args, flags } = await this.parse(Init);
    if (!flags.force && isRunningInAppDirectory() && this.project.name !== UNINITIALIZED_APP_NAME) {
      this.log(
        'Your app was already initialized. If you really want to create a new app in this directory, run `npx devvit init --force`.'
      );
      return;
    }

    this.#initAppFlags = flags;
    const appName = isRunningInAppDirectory() ? this.project.name : undefined;

    let rawCode = args.code;
    if (!rawCode) {
      // Redirect to web app creation wizard
      rawCode = await getCodeFromWizard(appName, flags.template, this);
    } /* else { // TODO: DX-9807 - Fire "Code was provided" telemetry event
    } */

    // Unpack the encoded parameters
    this.#initAppParams = unpackCode(rawCode);
    if (!this.#initAppParams) {
      this.error(
        `Invalid code provided. Run 'npx devvit init' or visit ${DEVVIT_PORTAL_URL}/new to get a new code.`
      );
    }
    if (this.#initAppFlags?.template) {
      this.#initAppParams.templateName = this.#initAppFlags.template;
    }

    // Login to CLI with one-time auth code
    if (this.#initAppParams.authCode) {
      const oAuthSvc = getOAuthSvc();
      let newToken: StoredToken;
      try {
        newToken = await oAuthSvc.fetchAccessToken(this.#initAppParams.authCode, true);
      } catch {
        this.error(
          `Failed to login with the provided code. Please run 'npx devvit init' or visit ${DEVVIT_PORTAL_URL}/new to get a new code.`
        );
      }
      await oAuthSvc.authTokenStore.writeFSToken(newToken, true);
    }

    if (isRunningInAppDirectory()) {
      // Update app name and ignore provided template, if any
      if (this.#initAppParams.appName) {
        this.project.name = this.#initAppParams.appName;
        this.log(
          `We've updated the app name to "${this.project.name}" in your ${this.project.filename}.`
        );
      }
      if (this.#initAppParams.templateName) {
        this.warn(
          `The template "${this.#initAppParams.templateName}" will be ignored since you are already inside a Devvit app.`
        );
      }
    } else {
      // Validate template and app name, then copy the template
      let templateName = this.#initAppParams.templateName;
      if (!templateName) {
        templateName = await this.#promptChooseTemplate();
      } else if (!(await templateResolver.isValidProjectTemplate(templateName))) {
        this.warn(`The template "${templateName}" is not valid. Please choose a valid template.`);
        templateName = await this.#promptChooseTemplate();
      }

      if (!this.#initAppParams.appName) {
        this.error('App name is required, but your code did not include one.');
      }

      await this.#copyProjectTemplate(this.#initAppParams.appName, templateName);
    }

    await gitInitIfNeeded(this.#projectPath);

    // Make package.json
    await updatePackageJSON(this.#projectPath, this.#initAppParams.appName);
    const { success: dependenciesInstalled } = await installAppDependencies(
      this.#projectPath,
      this
    );

    this.#logWelcomeMessage(path.relative(process.cwd(), this.#projectPath), {
      dependenciesInstalled,
    });

    // TODO: DX_9807 - Fire successful init telemetry event
  }

  async #promptChooseTemplate(): Promise<string> {
    const choices = (await templateResolver.options)
      .filter(({ hidden }) => !hidden)
      .map((option) => ({
        name: option.description
          ? `${chalk.bold(option.name)}: ${option.description}`
          : option.name,
        value: option.name,
      }));

    const res = await inquirer.prompt<{ templateName: string }>([
      {
        name: 'templateName',
        message: 'Choose a template:',
        type: 'list',
        choices,
      },
    ]);
    return res.templateName;
  }

  async #copyProjectTemplate(appName: string, templateName: string): Promise<void> {
    const templatePath = await templateResolver.getProjectUrl(templateName);
    const cutter = new Cutter(templatePath);
    await cutter.cut(this.#projectPath, {
      name: appName,
    });
  }

  #logWelcomeMessage(newProjectPath: string, props: { dependenciesInstalled: boolean }): void {
    this.log(`${chalk.bold.green(' 🚀🚀🚀 Devvit app successfully initialized! ')}`);

    // If we're running inside an app directory, it's likely during `npm run dev` and the welcome box is redundant.
    if (isRunningInAppDirectory()) return;

    const welcomeInstructions: string[] = [];

    const cdInstructions = `• ${chalk.cyan(
      `\`cd ${newProjectPath}\``
    )} to open your project directory`;
    welcomeInstructions.push(cdInstructions);

    if (!props.dependenciesInstalled) {
      const installInstructions = `• ${chalk.cyan(`\`npm install\``)} to install dependencies`;
      welcomeInstructions.push(installInstructions);
    }

    const playtestInstructions = `• ${chalk.cyan(
      `\`npm run dev\``
    )} to develop in your test community`;
    welcomeInstructions.push(playtestInstructions);

    const msg = welcomeInstructions.join('\n');

    logInBox(msg, { style: 'SINGLE', color: chalk.magenta });
  }
}

/**
 * Launches the app creation wizard and retrieves an initialization code from the user.
 *
 * @param appName - The name of the app to prefill in the wizard, or `undefined` if no name is available.
 *   - `undefined` indicates that the app name cannot be prefilled. This can occur if:
 *     - The command is not being run inside an app directory.
 *     - The command is being run inside an app directory, but the name in `devvit.json` is already taken by an app owned by a different user.
 * @param templateName - The name of the pre-selected template to clone, or `undefined` if unknown.
 *   - `undefined` indicates that the template cannot be determined. In this case, the wizard will prompt the user for a template
 *     if the command isn't running inside an app directory. A template cannot be determined if:
 *     - The command is running outside an app directory.
 *     - The command is running inside an app directory, but the template in use cannot be identified.
 * @returns A promise that resolves to the initialization code provided by the user.
 */
export async function getCodeFromWizard(
  appName: string | undefined,
  templateName: string | undefined,
  logger: { log(msg?: string): void; error(msg: string): void }
): Promise<string> {
  // Redirect to web app creation wizard
  if (isWebContainer()) {
    return await getCodeThroughCopyPaste(appName, templateName, logger);
    // TODO: DX-9807 - Fire "Code retrieved with copyPaste" telemetry event
  } else {
    return await getCodeThroughRedirectURL(appName, templateName, logger);
    // TODO: DX-9807 - Fire "Code retrieved with redirect URL" telemetry event
  }
}

async function getCodeThroughCopyPaste(
  appName: string | undefined,
  templateName: string | undefined,
  logger: { log(msg?: string): void; error: (msg: string) => void }
): Promise<string> {
  const queryParams: Record<string, string> = {
    source: getPlatformFromEnvironment(),
  };
  if (await getAccessToken()) {
    queryParams.skip_oauth = 'true';
  }
  if (isRunningInAppDirectory() || templateName) {
    queryParams.skip_template = 'true';
  }
  if (appName && appName !== UNINITIALIZED_APP_NAME) {
    queryParams.app_name = appName;
  }
  const creationWizardUrl = `${DEVVIT_PORTAL_URL}/new?${querystring.stringify(queryParams)}`;

  logger.log('Please open Reddit to continue:');
  logger.log();
  logger.log(creationWizardUrl.replace('*', '%2A'));
  logger.log();

  let codeOrEnter = '';
  while (codeOrEnter === '') {
    codeOrEnter = (
      await inquirer.prompt([
        {
          name: 'codeOrEnter',
          type: 'input',
          message:
            'Press enter to open Reddit in your browser, or just paste in the code you received:',
        },
      ])
    ).codeOrEnter;
    if (codeOrEnter === '') {
      try {
        await open(creationWizardUrl);
      } catch {
        logger.error(
          `An error occurred when opening Reddit. Please do it manually by going to:\n${creationWizardUrl}`
        );
      }
    }
  }

  return codeOrEnter;
}

async function getCodeThroughRedirectURL(
  appName: string | undefined,
  templateName: string | undefined,
  logger: { log(msg?: string): void; error: (msg: string) => void }
): Promise<string> {
  const queryParams: Record<string, string> = {
    source: getPlatformFromEnvironment(),
  };
  if (await getAccessToken()) {
    queryParams.skip_oauth = 'true';
  }
  if (isRunningInAppDirectory() || templateName) {
    queryParams.skip_template = 'true';
  }
  if (appName && appName !== UNINITIALIZED_APP_NAME) {
    queryParams.app_name = appName;
  }

  const line = readLine();
  return await localCodeServer({
    serverListeningCallback: ({ port, state }) => {
      const redirectUrl = new URL(`http://localhost:${port}`);
      redirectUrl.searchParams.set(`state`, state);
      queryParams.redirect_url = redirectUrl.toString();

      const creationWizardUrl = `${DEVVIT_PORTAL_URL}/new?${querystring.stringify(queryParams)}`;
      logger.log(
        'Please open Reddit to continue:\n\n' +
          `${creationWizardUrl.replace('*', '%2A')}\n\n` +
          'Press enter to open this link immediately...'
      );
      // Don't await. Start the server immediately, so we don't miss a callback.
      line.then(() => open(creationWizardUrl)).catch(() => {});
    },
    requestHandler: async (queryParams) => {
      if (!queryParams.code) {
        return false;
      }
      const queryCode = queryParams.code;
      return typeof queryCode === 'string' ? queryCode : queryCode[0];
    },
  }).finally(() => line.reject());
}

export function unpackCode(base64code: string): InitAppResponse | undefined {
  try {
    const bytes = Buffer.from(base64code, 'base64');
    const message = InitAppResponse.decode(bytes);

    // Basic validation
    if (!message.appName) {
      return undefined;
    }

    return message;
  } catch {
    return undefined;
  }
}

export async function gitInitIfNeeded(projectPath: string): Promise<void> {
  if (existsSync(path.join(projectPath, '.git'))) {
    return;
  }
  await git.init({
    fs,
    dir: projectPath,
    defaultBranch: 'main',
  });
}
export async function updatePackageJSON(projectPath: string, appName: string): Promise<void> {
  const pkgJsonPath = path.join(projectPath, 'package.json');
  const templatePkgJson = JSON.parse(await readFile(pkgJsonPath, 'utf8'));

  const pkgJson = {
    ...templatePkgJson,
    name: appName,
    version: '0.0.0',
    type: 'module',
    private: true,
    license: 'BSD-3-Clause',
  };

  // Install dependencies with npm
  syncDependenciesToCurrentCliVersion(pkgJson.dependencies ?? {});
  syncDependenciesToCurrentCliVersion(pkgJson.devDependencies ?? {});
  await writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2));
}

export async function installAppDependencies(
  projectPath: string,
  logger: { log(msg?: string): void }
): Promise<{ success: boolean }> {
  logger.log(`${chalk.bold.yellow(' 🔧 Installing dependencies...')}`);
  try {
    await exec(`npm i --loglevel=error --no-fund`, {
      cwd: projectPath,
    });
    // If `exec` resolves, the install exited with code 0, so we consider it a success.
    return { success: true };
  } catch {
    return { success: false };
  }
}

// mutates the deps object
function syncDependenciesToCurrentCliVersion(deps: Record<string, string>): void {
  for (const dep of Object.keys(deps)) {
    if (isDevvitDependency(dep)) {
      if (CLI_VERSION.prerelease.includes('dev')) {
        // if we are in a dev version, we want to use a path to the neighboring copy of this dependency
        const packageName = dep.startsWith('@devvit') ? dep.replace('@devvit/', '') : dep;
        deps[dep] = path.resolve(import.meta.dirname, '../../../', packageName);
      } else {
        deps[dep] = `${CLI_VERSION}`;
      }
    }
  }
}
