import { startServer as startDevvitServer } from '@devvit/dev-server/server/index.js';
import { Flags } from '@oclif/core';
import getPort, { portNumbers } from 'get-port';
import inquirer from 'inquirer';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import open from 'open';
import ps from 'ps-node';

import { DOT_DEVVIT_DIR_FILENAME } from '@devvit/dev-server/server/config.js';
import { readLine } from '@devvit/dev-server/server/io/input-util.js';
import chalk from 'chalk';
import type { Server } from 'node:http';
import { AUTH_CONFIG } from '../util/auth.js';
import { ProjectCommand } from '../util/commands/ProjectCommand.js';
import { DEVVIT_DISABLE_EXTERN_DEVVIT_PROTOS } from '../util/config.js';
import { logInBox } from '../util/ui.js';

const PORT_RANGE = {
  LOWER_BOUND: 3000,
  UPPER_BOUND: 3100,
};

type ConfirmUsePortPromptResult = {
  confirmUsePort: boolean;
};

type DevServerInfo = {
  port: number;
  projectDir: string;
};

type DevServerPidLockfile = {
  [pid: string]: DevServerInfo;
};

export default class Start extends ProjectCommand {
  static override description = 'DEPRECATED. **Please switch to `devvit playtest`**';

  static override examples = ['$ devvit start -p 3000'];

  static override flags = {
    port: Flags.integer({
      char: 'p',
      description: 'Specify the port number on localhost to serve the Dev Studio',
    }),
  };

  #devvitServer: Server | undefined;

  #getPidLockfilePath(): string {
    return path.join(DOT_DEVVIT_DIR_FILENAME, 'pid.lockfile.json');
  }

  async #createPidLockfileIfNotExists(): Promise<void> {
    const lockfilePath = this.#getPidLockfilePath();
    const devvitConfigDir = path.dirname(lockfilePath);

    if (!fs.existsSync(devvitConfigDir)) {
      await fsp.mkdir(devvitConfigDir, { recursive: true });
    }
    if (!fs.existsSync(lockfilePath)) {
      await fsp.open(lockfilePath, 'w');
    }
  }

  async #readPidLockfile(): Promise<DevServerPidLockfile> {
    return JSON.parse(
      (await fsp.readFile(this.#getPidLockfilePath(), { encoding: 'utf8' })) || '{}'
    ) as DevServerPidLockfile;
  }

  async #getRunningNodeProcessPids(): Promise<Set<number>> {
    return new Promise<Set<number>>((resolve, reject) => {
      ps.lookup({ command: 'node' }, (err, resultList) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(new Set<number>(resultList.map((p) => Number(p.pid))));
      });
    });
  }

  async #beforeDevServerStartup(projectDir: string): Promise<void> {
    await this.#createPidLockfileIfNotExists();

    const currentNodeProcesses = await this.#getRunningNodeProcessPids();

    const staleLockfile = await this.#readPidLockfile();
    const updatedLockfile: DevServerPidLockfile = {};

    Object.entries(staleLockfile).forEach(([pid, pInfo]) => {
      if (currentNodeProcesses.has(parseInt(pid))) {
        // don't wipe entries of proceses that are still running
        updatedLockfile[pid] = pInfo;

        // only one dev-server per project
        if (pInfo.projectDir === projectDir) {
          this.error(
            `There is already a dev-server running for this project listening at http://localhost:${pInfo.port}`
          );
        }
      }
    });

    await fsp.writeFile(this.#getPidLockfilePath(), JSON.stringify(updatedLockfile, null, 2));
  }

  async #afterDevServerStartup(projectDir: string, port: number): Promise<void> {
    const lockfile = await this.#readPidLockfile();

    // lockfile should not have my pid if I'm just starting up
    if (lockfile[process.pid] != null) {
      this.warn('pid.lockfile.json is malformed. Stopping all dev-server processes');
      const currentNodeProcesses = await this.#getRunningNodeProcessPids();
      Object.keys(lockfile).forEach((pid) => {
        // don't kill ourself yet
        if (parseInt(pid) === process.pid) return;

        if (currentNodeProcesses.has(parseInt(pid))) {
          ps.kill(pid);
        }
      });

      await fsp.rm(this.#getPidLockfilePath(), { force: true });
      this.exit(1);
    }

    // append my pid to lockfile
    lockfile[process.pid] = {
      port,
      projectDir,
    };

    await fsp.writeFile(this.#getPidLockfilePath(), JSON.stringify(lockfile, null, 2));
  }

  async run(): Promise<void> {
    await this.checkIfUserLoggedIn();
    await this.checkDevvitTermsAndConditions();

    process.chdir(this.projectRoot);

    const { flags } = await this.parse(Start);

    const preferredPorts = flags.port ? [flags.port] : [];
    const portNumber = await getPort({
      port: [...preferredPorts, ...portNumbers(PORT_RANGE.LOWER_BOUND, PORT_RANGE.UPPER_BOUND)],
    });

    // when user-specified port is unavailable, prompt to make sure that user is
    // okay with the port we find for them
    if (flags.port != null && flags.port !== portNumber) {
      const { confirmUsePort }: ConfirmUsePortPromptResult = await inquirer.prompt([
        {
          name: 'confirmUsePort',
          message: `Port ${flags.port} is already in use. Use next available port ${portNumber}?`,
          type: 'confirm',
        },
      ]);

      if (!confirmUsePort) {
        this.error('Aborting...');
      }
    }

    await this.#beforeDevServerStartup(this.projectRoot);
    this.#devvitServer = await startDevvitServer({
      disableExternDevvitProtos: DEVVIT_DISABLE_EXTERN_DEVVIT_PROTOS,
      projectDir: this.projectRoot,
      port: portNumber,
      authPluginConfig: {
        dotDevvitDir: DOT_DEVVIT_DIR_FILENAME,
        auth: AUTH_CONFIG,
      },
    });
    await this.#afterDevServerStartup(this.projectRoot, portNumber);

    if (!this.#devvitServer) {
      this.error('An error occurred when starting the dev server');
    }

    const msg = `Dev Studio listening on: ${chalk.cyan.bold(
      `http://localhost:${portNumber}`
    )} ...but you should use Playtest instead!`;

    await this.#promptOpenBrowser(msg);
  }

  async #openDevStudio(): Promise<void> {
    if (this.#devvitServer == null) {
      this.error('There was an error starting the dev server');
    }
    const devServerAddress = this.#devvitServer.address();

    if (devServerAddress) {
      const addr =
        typeof devServerAddress === 'string'
          ? `http://${devServerAddress}`
          : `http://localhost:${devServerAddress.port}`;

      await open(addr, { wait: false });
    }
  }

  async #promptOpenBrowser(msg: string): Promise<void> {
    logInBox(`${msg}\n\nPress enter to open, control-c to quit.`, {
      color: chalk.magenta,
      padding: {
        x: 2,
        y: 0,
      },
    });
    if (await readLine()) void this.#openDevStudio();
  }
}
