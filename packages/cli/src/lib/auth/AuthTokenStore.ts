import os from 'node:os';
import path from 'node:path';

import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import chalk from 'chalk';
import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import fsp, { mkdir, readFile } from 'fs/promises';
import type { Observable } from 'rxjs';
import { ReplaySubject } from 'rxjs';

import { DEFAULT_DOTENV_PATH, DEVVIT_AUTH_TOKEN } from '../../constants/Environment.js';
import {
  deleteVariableFromDotEnv,
  writeVariableToDotEnv,
} from '../../util/common-actions/dotEnvOperations.js';
import { isFile } from '../../util/file-util.js';
import { isWebContainer } from '../../util/platform-util.js';
import { StoredToken } from './StoredToken.js';

export const WATCHER_INTERVAL = 1000;

export type TokenInfo = {
  token: StoredToken;
  // boolean which indicates whether or not this token is generated with `devvit login --copy-paste`. The OAuth headers used for fetching access tokens differ based on this flag
  copyPaste?: boolean;
};

export class AuthTokenStore {
  readonly #dotDevvitDir: string;

  #tokenFileWatcher: FSWatcher | undefined;
  #tokenFileUpdatesObservable: ReplaySubject<TokenInfo> | undefined;

  async dispose(): Promise<void> {
    await this.#tokenFileWatcher?.close();
  }

  get updates(): Observable<TokenInfo> {
    if (!this.fileWatcherInitd) {
      this.#initTokenFileWatcher();
    }
    return this.#tokenFileUpdatesObservable!.pipe();
  }

  get fileWatcherInitd(): boolean {
    return this.#tokenFileWatcher !== undefined && this.#tokenFileUpdatesObservable !== undefined;
  }

  get #tokenLocation(): string {
    return path.join(this.#dotDevvitDir, 'token');
  }

  constructor(dotDevvitDir: string = path.join(os.homedir(), '.devvit')) {
    this.#dotDevvitDir = dotDevvitDir;
  }

  async readFSToken(): Promise<TokenInfo | undefined> {
    let rawToken: string;
    if (process.env[DEVVIT_AUTH_TOKEN]) {
      rawToken = process.env[DEVVIT_AUTH_TOKEN];
    } else {
      if (!(await isFile(this.#tokenLocation))) {
        return undefined;
      }

      rawToken = await readFile(this.#tokenLocation, { encoding: 'utf8' });
      if (rawToken == null) {
        return undefined;
      }
    }

    try {
      const jsonParse = JSON.parse(rawToken);
      const token = StoredToken.fromBase64(jsonParse.token);
      if (!token) {
        return undefined;
      }
      return {
        token,
        copyPaste: !!jsonParse.copyPaste,
      };
    } catch {
      // This is fine, the JSON parse failed, which means it's an old style token
      const token = StoredToken.fromBase64(rawToken);
      if (!token) {
        return undefined;
      }
      return {
        token,
        copyPaste: false,
      };
    }
  }

  async writeFSToken(token: StoredToken, copyPaste?: boolean): Promise<void> {
    const rawToken = JSON.stringify({
      token: Buffer.from(JSON.stringify(token)).toString('base64'),
      copyPaste: !!copyPaste,
    });
    if (isWebContainer()) {
      // If we're running in a web IDE, write the token to the .env file
      await writeVariableToDotEnv(DEVVIT_AUTH_TOKEN, rawToken, DEFAULT_DOTENV_PATH);
      console.log(
        `Your Devvit authentication token has been saved to ${chalk.green(DEFAULT_DOTENV_PATH)}`
      );
    } else {
      await mkdir(this.#dotDevvitDir, { recursive: true });
      await fsp.writeFile(this.#tokenLocation, rawToken, 'utf8');
      console.log(
        `Your Devvit authentication token has been saved to ${chalk.green(this.#tokenLocation)}`
      );
    }
  }

  async clearToken(): Promise<void> {
    await mkdir(this.#dotDevvitDir, { recursive: true });
    await fsp.writeFile(this.#tokenLocation, '', 'utf8');
    await fsp.rm(this.#tokenLocation, { force: true });
    await deleteVariableFromDotEnv(DEVVIT_AUTH_TOKEN, DEFAULT_DOTENV_PATH);
  }

  #initTokenFileWatcher(): void {
    this.#tokenFileWatcher = chokidar.watch(this.#tokenLocation, {
      ignoreInitial: false,
      interval: WATCHER_INTERVAL,
    });

    // we only need the subject to keep the latest pushed StoredToken
    const REPLAY_SUBJECT_BUFFER_SIZE = 1;
    this.#tokenFileUpdatesObservable = new ReplaySubject<TokenInfo>(REPLAY_SUBJECT_BUFFER_SIZE);
    this.#tokenFileWatcher.on('all', () => {
      this.readFSToken()
        .then((updatedToken) => {
          // if updated token is valid
          if (updatedToken != null) {
            this.#tokenFileUpdatesObservable!.next(updatedToken);
          }
        })
        .catch((err) => {
          console.error(StringUtil.caughtToString(err));
          // token is malformed, don't push updates so no-op
        });
    });
  }
}
