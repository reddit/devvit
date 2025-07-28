import { exec as _exec } from 'node:child_process';
import fs, { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import querystring from 'node:querystring';
import util from 'node:util';

import { InitAppResponse } from '@devvit/protos/types/devvit/cli/init.js';
import { isDevvitDependency } from '@devvit/shared-types/isDevvitDependency.js';
import { Args } from '@oclif/core';
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
import { ProjectTemplateResolver } from '../util/template-resolvers/ProjectTemplateResolver.js';
import { logInBox } from '../util/ui.js';

const exec = util.promisify(_exec);

const templateResolver = new ProjectTemplateResolver();
const require = createRequire(import.meta.url);
// eslint-disable-next-line security/detect-non-literal-require
const cliPackageJSON = require(require.resolve(`@devvit/cli/package.json`));
const CLI_VERSION = semver.parse(cliPackageJSON.version)!;

export default class Init extends DevvitCommand {
  static override description = 'Initialize a new app';

  static override examples = ['$ devvit init', '$ devvit init <code>'];

  static override args = {
    code: Args.string({
      description:
        'A code given to you by Reddit to initialize your app. If no code is entered, you will be redirected to the web to create your app and receive a code.',
      required: false,
    }),
  } as const;

  #initAppParams: InitAppResponse | undefined;

  get #projectPath(): string {
    if (!this.#initAppParams?.appName) {
      this.error('The project was not properly initialized. Aborting');
    }
    // If we were running inside a project, we use the current working directory
    if (this.isRunningInAppDirectory()) {
      return process.cwd();
    }
    // Else, we're using the app slug as the dir name
    return path.join(process.cwd(), this.#initAppParams.appName);
  }

  override async run(): Promise<void> {
    // TODO: DX-9807 - 0. Fire the init telemetry event

    const { args } = await this.parse(Init);

    let rawCode = args.code;
    if (!rawCode) {
      // Redirect to web app creation wizard
      if (isWebContainer()) {
        rawCode = await this.#getCodeThroughCopyPaste();
        // TODO: DX-9807 - Fire "Code retrieved with copyPaste" telemetry event
      } else {
        rawCode = await this.#getCodeThroughRedirectURL();
        // TODO: DX-9807 - Fire "Code retrieved with redirect URL" telemetry event
      }
    } /* else { // TODO: DX-9807 - Fire "Code was provided" telemetry event
    } */

    // Unpack the encoded parameters
    this.#initAppParams = this.#unpackCode(rawCode);
    if (!this.#initAppParams) {
      this.error(
        `Invalid code provided. Run 'npm run init' or visit ${DEVVIT_PORTAL_URL}/new to get a new code.`
      );
    }
    this.log('Successfully unpacked app code.');

    // Login to CLI with one-time auth code
    if (this.#initAppParams.authCode) {
      const oAuthSvc = getOAuthSvc();
      let newToken: StoredToken;
      try {
        newToken = await oAuthSvc.fetchAccessToken(this.#initAppParams.authCode, true);
      } catch {
        this.error(
          `Failed to login with the provided code. Please run 'npm run init' then try 'npm create devvit' again.`
        );
      }
      await oAuthSvc.authTokenStore.writeFSToken(newToken, true);
    }

    if (this.isRunningInAppDirectory()) {
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

    await this.#gitInitIfNeeded();

    // Make package.json
    const pkgJsonPath = path.join(this.#projectPath, 'package.json');
    const templatePkgJson = JSON.parse(await readFile(pkgJsonPath, 'utf8'));
    const pkgJson = {
      ...templatePkgJson,
      name: this.#initAppParams.appName,
      version: '0.0.0',
      type: 'module',
      private: true,
      license: 'BSD-3-Clause',
    };

    // Install dependencies with npm
    this.#syncDependenciesToCurrentCliVersion(pkgJson.dependencies ?? {});
    this.#syncDependenciesToCurrentCliVersion(pkgJson.devDependencies ?? {});
    await writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    const { success: dependenciesInstalled } = await this.#installAppDependencies();

    this.#logWelcomeMessage(path.relative(process.cwd(), this.#projectPath), {
      dependenciesInstalled,
    });

    // TODO: DX_9807 - Fire successful init telemetry event
  }

  #unpackCode(base64code: string): InitAppResponse | undefined {
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

  async #getCodeThroughCopyPaste(): Promise<string> {
    const queryParams: Record<string, string> = {
      source: getPlatformFromEnvironment(),
    };
    if (await getAccessToken()) {
      queryParams.skip_oauth = 'true';
    }
    if (this.isRunningInAppDirectory()) {
      queryParams.skip_template = 'true';
      if (this.project.name) {
        queryParams.app_name = this.project.name;
      }
    }
    const creationWizardUrl = `${DEVVIT_PORTAL_URL}/new?${querystring.stringify(queryParams)}`;

    console.log('Please open Reddit to continue:');
    console.log();
    console.log(creationWizardUrl.replace('*', '%2A'));
    console.log();

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
          console.error(
            `An error occurred when opening Reddit. Please do it manually by going to:\n${creationWizardUrl}`
          );
        }
      }
    }

    return codeOrEnter;
  }

  async #getCodeThroughRedirectURL(): Promise<string> {
    const queryParams: Record<string, string> = {
      source: getPlatformFromEnvironment(),
    };
    if (await getAccessToken()) {
      queryParams.skip_oauth = 'true';
    }
    if (this.isRunningInAppDirectory()) {
      queryParams.skip_template = 'true';
      if (this.project.name) {
        queryParams.app_name = this.project.name;
      }
    }

    const line = readLine();
    return await localCodeServer({
      serverListeningCallback: ({ port, state }) => {
        const redirectUrl = new URL(`http://localhost:${port}`);
        redirectUrl.searchParams.set(`state`, state);
        queryParams.redirect_url = redirectUrl.toString();

        const creationWizardUrl = `${DEVVIT_PORTAL_URL}/new?${querystring.stringify(queryParams)}`;
        console.log(
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

  async #gitInitIfNeeded(): Promise<void> {
    if (existsSync(path.join(this.#projectPath, '.git'))) {
      return;
    }
    await git.init({
      fs,
      dir: this.#projectPath,
      defaultBranch: 'main',
    });
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

  async #installAppDependencies(): Promise<{ success: boolean }> {
    this.log(`${chalk.bold.yellow(' 🔧 Installing dependencies...')}`);
    const npmInstallationOutput = await exec(`npm i --loglevel=error --no-fund`, {
      cwd: this.#projectPath,
    });
    return { success: npmInstallationOutput.stderr === '' };
  }

  // mutates the deps object
  #syncDependenciesToCurrentCliVersion(deps: Record<string, string>): void {
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

  #logWelcomeMessage(newProjectPath: string, props: { dependenciesInstalled: boolean }): void {
    this.log(`${chalk.bold.green(' 🚀🚀🚀 Devvit app successfully initialized! ')}`);

    const welcomeInstructions: string[] = [];

    if (!this.isRunningInAppDirectory()) {
      const cdInstructions = `• ${chalk.cyan(
        `\`cd ${newProjectPath}\``
      )} to open your project directory`;
      welcomeInstructions.push(cdInstructions);
    }

    if (!props.dependenciesInstalled) {
      const installInstructions = `• ${chalk.cyan(`\`npm install\``)} to install dependencies`;
      welcomeInstructions.push(installInstructions);
    }
    const uploadInstructions = `• ${chalk.cyan(`\`npm run deploy\``)} to upload your app`;
    welcomeInstructions.push(uploadInstructions);

    const playtestInstructions = `• ${chalk.cyan(
      `\`npm run dev\``
    )} to develop in your test community`;
    welcomeInstructions.push(playtestInstructions);

    const msg = welcomeInstructions.join('\n');

    logInBox(msg, { style: 'SINGLE', color: chalk.magenta });
  }
}
