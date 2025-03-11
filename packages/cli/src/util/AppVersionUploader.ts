import fsp from 'node:fs/promises';
import path from 'node:path';

import {
  type AppVersionInfo,
  type Bundle,
  InstallationType,
  type VersionVisibility,
} from '@devvit/protos/community.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import type { DevvitVersion } from '@devvit/shared-types/Version.js';
import { ux } from '@oclif/core';
import { default as glob } from 'tiny-glob';

import { AssetUploader } from './AssetUploader.js';
import { createAppVersionClient } from './clientGenerators.js';
import type { ProjectCommand } from './commands/ProjectCommand.js';
import { getPaymentsConfig, type JSONProduct, readProducts } from './payments/paymentsConfig.js';
import { handleTwirpError } from './twirp-error-handler.js';

export class AppVersionUploader {
  readonly #cmd: ProjectCommand;
  readonly #verbose: boolean;

  readonly #appVersionClient = createAppVersionClient();

  constructor(cmd: ProjectCommand, { verbose }: { verbose: boolean }) {
    this.#cmd = cmd;
    this.#verbose = verbose;
  }

  async createVersion(
    appInfo: {
      appId: string;
      appSlug: string;
      appSemver: DevvitVersion;
      visibility: VersionVisibility;
    },
    bundles: Bundle[]
  ): Promise<AppVersionInfo> {
    const about = await this.#getReadmeContent();

    // Sync and upload assets
    const assetUploader = new AssetUploader(this.#cmd, appInfo.appSlug, { verbose: this.#verbose });
    const { assetMap, webViewAssetMap } = await assetUploader.syncAssets();

    let products: JSONProduct[] | undefined;

    try {
      products = await readProducts(this.#cmd.projectRoot);
    } catch (err) {
      throw new Error(
        `An unknown error occurred when reading and validating products.json.
  Please refer to https://developers.reddit.com/docs/capabilities/payments and ensure that your app is in a compatible state.
  ${StringUtil.caughtToString(err, 'message')}`
      );
    }

    await Promise.all(
      // Dump these in the assets fields of the bundles
      bundles.map(async (bundle) => {
        bundle.assetIds = assetMap ?? {};
        bundle.webviewAssetIds = webViewAssetMap ?? {};

        if (products) {
          bundle.paymentsConfig = getPaymentsConfig(bundle, products);
        }
      })
    );

    ux.action.start(`Uploading new version "${appInfo.appSemver.toString()}" to Reddit`);
    try {
      // Actually create the app version
      const appVersionInfo = await this.#appVersionClient.Create({
        appId: appInfo.appId,
        visibility: appInfo.visibility,
        about,
        validInstallTypes: [InstallationType.SUBREDDIT], // TODO: Once we have user/global installs, we'll need to ask about this.
        majorVersion: appInfo.appSemver.major,
        minorVersion: appInfo.appSemver.minor,
        patchVersion: appInfo.appSemver.patch,
        prereleaseVersion: appInfo.appSemver.prerelease,
        actorBundles: bundles,
      });
      ux.action.stop();

      return appVersionInfo;
    } catch (error) {
      ux.action.stop('Error');

      return handleTwirpError(error, (message: string) => this.#cmd.error(message));
    }
  }

  /**
   * Get the 'about' text from a README.md file
   */
  async #getReadmeContent(): Promise<string> {
    let about = '';

    const readmeFileName = 'README.md';
    const readmePath = (await glob('*.md', { cwd: this.#cmd.projectRoot })).filter(
      (file) => file.toLowerCase() === readmeFileName.toLowerCase()
    );

    if (readmePath.length > 1) {
      this.#cmd.log(
        `Found multiple '${readmeFileName}'-looking files - going with '${readmePath[0]}'`
      );
    }

    if (readmePath.length >= 1) {
      about = await fsp.readFile(path.join(this.#cmd.projectRoot, readmePath[0]), 'utf-8');
    } else {
      this.#cmd.log(
        `Couldn't find ${readmeFileName}, so not setting an 'about' for this app version (you can update this later)`
      );
    }

    return about;
  }
}
