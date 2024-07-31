import type { PenSave } from '@devvit/play';
import { penFromHash } from '@devvit/play';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import { DevvitVersion } from '@devvit/shared-types/Version.js';
import { APP_SLUG_BASE_MAX_LENGTH, makeSlug, sluggable } from '@devvit/shared-types/slug.js';
import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import type { Validator } from 'inquirer';
import inquirer from 'inquirer';
import { readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { URL } from 'node:url';
import semver from 'semver';
import Cutter from '../util/Cutter.js';
import { Git } from '../util/Git.js';
import { DevvitCommand, toLowerCaseArgParser } from '../util/commands/DevvitCommand.js';
import { generateDevvitConfig } from '../util/devvitConfig.js';
import { ProjectTemplateResolver } from '../util/template-resolvers/ProjectTemplateResolver.js';
import { logInBox } from '../util/ui.js';
import { exec as _exec } from 'node:child_process';
import util from 'node:util';
import type { CommandError } from '@oclif/core/lib/interfaces/index.js';
import { sendEvent } from '../util/metrics.js';

const exec = util.promisify(_exec);

const templateResolver = new ProjectTemplateResolver();
const require = createRequire(import.meta.url);
// eslint-disable-next-line security/detect-non-literal-require
const cliPackageJSON = require(require.resolve(`@devvit/cli/package.json`));
const CLI_VERSION = semver.parse(cliPackageJSON.version)!;

type CreateAppArgs = {
  appName: string | undefined;
};

type CreateAppFlags = {
  yes: boolean;
  here: boolean;
  template: string | undefined;
  noDependencies: boolean;
};

type CreateAppParseResult = {
  args: CreateAppArgs;
  flags: CreateAppFlags;
};

type CreateAppParams = {
  appName: string;
  /** Static project template name like custom-post. */
  templateName: string;
  /** Pen unpacked from play URL template. */
  pen: PenSave | undefined;
};
export default class New extends DevvitCommand {
  static override description = 'Create a new app';

  static override examples = ['$ devvit new'];

  static override flags = {
    yes: Flags.boolean({
      required: false,
      default: false,
      description: 'Flag to skip all prompts and use defaults',
      hidden: true, // this is mainly for our CI, no need to expose in help for end users
    }),
    here: Flags.boolean({
      required: false,
      default: false,
      description: 'Flag to generate the project here, and not in a subdirectory',
    }),
    template: Flags.string({
      description:
        'Template name or pen URL. Available templates are: ' +
        `${templateResolver.options.filter(({ hidden }) => !hidden).join(', ')}.`,
      required: false,
      char: 't',
    }),
    noDependencies: Flags.boolean({
      required: false,
      default: false,
      description: 'Flag to skip dependency installation step',
    }),
  };

  static override args = {
    appName: Args.string({
      description:
        'Name of the app. A new directory with the provided app name will be created. If no name is entered, you will be prompted to choose one in the next step.',
      required: false,
      parse: toLowerCaseArgParser,
    }),
  };

  #createAppParams: CreateAppParams | null = null;
  #createAppFlags: CreateAppFlags | null = null;

  #event = {
    source: 'devplatform_cli',
    action: 'ran',
    noun: 'new_app',
    devplatform: {
      cli_raw_command_line: 'devvit ' + process.argv.slice(2).join(' '),
      cli_is_valid_command: true,
      cli_command: 'new',
    } as Record<string, string | boolean | undefined>,
  };
  #eventSent = false;

  #appNameValidator: NonNullable<Validator> = async (rawAppName: string) => {
    const existingDirNames = new Set(
      readdirSync(process.cwd(), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    );
    if (existingDirNames.has(rawAppName)) {
      return `The directory "${rawAppName}" already exists. Use a new directory name!`;
    }
    if (!sluggable(rawAppName)) {
      return `The app name is invalid. An app name must:\n\t1. be between 3~${APP_SLUG_BASE_MAX_LENGTH} characters long\n\t2. contain only the following characters: [0-9], [a-z], [A-Z], spaces, and dashes\n\t3. begin with a letter\n\t`;
    }
    return true;
  };

  get #slug(): string {
    if (this.#createAppParams?.appName == null) {
      this.error('The project was not properly initialized. Aborting');
    }
    return makeSlug(this.#createAppParams.appName);
  }

  get #projectPath(): string {
    if (this.#createAppParams?.appName == null) {
      this.error('The project was not properly initialized. Aborting');
    }
    // if we were told to make it here, then make it here
    if (this.#createAppFlags?.here) {
      return process.cwd();
    }
    // else, we're using the app slug (without the unique suffix) as the dir name
    return path.join(process.cwd(), this.#slug);
  }

  override async run(): Promise<void> {
    const { args, flags }: CreateAppParseResult = await this.parse(New);
    this.#createAppFlags = flags;

    if (flags.yes) {
      this.warn(
        'You are running this command using the --yes flag. This means that the app will be created using default settings'
      );
      if (args.appName == null) {
        this.error(
          'The app name must be provided when running the command with the --yes flag. Otherwise, there is no context as to where the new app should be created and how it should be identified when published to the App Store'
        );
      }
    }

    // do the necessary prompts to get information required for setting up a new project
    await this.#initCreateAppParams(args, flags);
    assertNonNull(
      this.#createAppParams,
      'Expected params to be initialized at this point for app creation'
    );
    this.#event.devplatform.app_name = this.#createAppParams.appName;
    this.#event.devplatform.cli_new_app_template = this.#createAppParams.templateName;

    // Copy project template
    await this.#copyProjectTemplate();

    // Make devvit.yaml (we put in the app name as is without a unique suffix)
    await generateDevvitConfig(this.#projectPath, this.configFile, {
      name: this.#createAppParams.appName,
      version: DevvitVersion.fromString('0.0.0').toString(),
    });

    // git init
    await this.#gitInit();

    // make package.json
    const pkgJsonPath = path.join(this.#projectPath, 'package.json');
    const templatePkgJson = JSON.parse(await readFile(pkgJsonPath, 'utf8'));
    const pkgJson = {
      ...templatePkgJson,
      name: this.#slug,
      version: '0.0.0',
      type: 'module',
      private: true,
      license: 'BSD-3-Clause',
    };
    this.#syncDependenciesToCurrentCliVersion(pkgJson.dependencies ?? {});
    this.#syncDependenciesToCurrentCliVersion(pkgJson.devDependencies ?? {});
    await writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

    // skip dependency installation if 'yes' is set to avoid unexpected changes in CI
    const dependenciesInstalled =
      flags.yes || flags.noDependencies ? false : (await this.#installAppDependencies()).success;

    this.#logWelcomeMessage(path.relative(process.cwd(), this.#projectPath), {
      dependenciesInstalled,
    });

    await this.#sendEventIfNotSent();
  }

  async #gitInit(): Promise<void> {
    const git = new Git(this.#projectPath);
    await git.init();
    await git.initDotGitIgnore();
  }

  async #initCreateAppParams(
    args: Readonly<CreateAppArgs>,
    flags: Readonly<CreateAppFlags>
  ): Promise<void> {
    // If the template is a URL, unpack it as a pen. This code does not throw.
    let pen;
    if (flags.template) {
      // to-do: use URL.canParse(). penFromHash() doesn't throw.
      try {
        pen = penFromHash(new URL(flags.template).hash);
      } catch {} // eslint-disable-line no-empty
    }
    // Favor explicit appName to pen name default.
    const name = args.appName || pen?.name;
    if (name) {
      const validationResult = await this.#appNameValidator(name);
      if (typeof validationResult === 'string') {
        this.error(validationResult);
      }
    }

    const appName = name || (await this.#promptAppName());

    // If the template is not a pen, and the user did not enter a template flag, prompt them to choose
    const templateName = pen
      ? // Pens alway use the pen template.
        'pen'
      : flags.template ?? (await this.#promptChooseTemplate());

    this.#createAppParams = {
      appName: appName.toLowerCase(),
      templateName,
      pen,
    };
  }

  async #promptAppName(): Promise<string> {
    const res = await inquirer.prompt<{ appName: string }>([
      {
        name: 'appName',
        message: 'Project name:',
        type: 'input',
        validate: this.#appNameValidator,
        filter: (input: unknown) => {
          return String(input).trim().toLowerCase();
        },
      },
    ]);
    return res.appName;
  }

  async #promptChooseTemplate(): Promise<string> {
    const choices = templateResolver.options
      .filter(({ hidden }) => !hidden)
      .map((option) => ({
        name: option.description ? `${option.name}: ${option.description}` : option.name,
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

  async #copyProjectTemplate(): Promise<void> {
    const templatePath = templateResolver.resolve({
      name: this.#createAppParams!.templateName,
    });
    const cutter = new Cutter(templatePath);
    await cutter.cut(this.#projectPath, {
      name: this.#createAppParams!.appName,
      // Specify pen source Mustache template, if any.
      mainSrc: this.#createAppParams?.pen?.src ?? '',
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
      if (dep.startsWith('@devvit')) {
        deps[dep] = `${CLI_VERSION}`;
      }
    }
  }

  #logWelcomeMessage(newProjectPath: string, props: { dependenciesInstalled: boolean }): void {
    if (this.#createAppFlags?.here) {
      return;
    }

    this.log(`${chalk.bold.green(' 🚀🚀🚀 Devvit app successfully created! ')}`);

    const welcomeInstructions: string[] = [];

    const cdInstructions = `• ${chalk.cyan(
      `\`cd ${newProjectPath}\``
    )} to open your project directory`;
    welcomeInstructions.push(cdInstructions);

    if (!props.dependenciesInstalled) {
      const installInstructions = `• ${chalk.cyan(`\`npm install\``)} to install dependencies`;
      welcomeInstructions.push(installInstructions);
    }
    const uploadInstructions = `• ${chalk.cyan(`\`devvit upload\``)} to upload your app`;
    welcomeInstructions.push(uploadInstructions);

    const playtestInstructions = `• ${chalk.cyan(
      `\`devvit playtest <subreddit>\``
    )} to develop in your test community`;
    welcomeInstructions.push(playtestInstructions);

    const msg = welcomeInstructions.join('\n');

    logInBox(msg, { style: 'SINGLE', color: chalk.magenta });
  }

  async #sendEventIfNotSent(): Promise<void> {
    if (!this.#eventSent) {
      this.#eventSent = true;
      await sendEvent(this.#event);
    }
  }

  override async catch(err: CommandError): Promise<unknown> {
    this.#event.devplatform.cli_upload_is_successful = false;
    this.#event.devplatform.cli_upload_failure_reason = err.message;
    await this.#sendEventIfNotSent();
    return super.catch(err);
  }
}
