import fsp from 'node:fs/promises';
import path from 'node:path';

import {
  type AppVersionInfo,
  InstallationType,
  type VersionVisibility,
} from '@devvit/protos/community.js';
import type { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import { PRODUCTS_JSON_FILE } from '@devvit/shared-types/constants.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import type { DevvitVersion } from '@devvit/shared-types/Version.js';
import { ux } from '@oclif/core';
import { default as glob } from 'tiny-glob';

import { AssetUploader } from './AssetUploader.js';
import { createAppVersionClient } from './clientGenerators.js';
import type { DevvitCommand } from './commands/DevvitCommand.js';
import { decodeAsUtf8, decodeAsUtf16 } from './encodings.js';
import { getPaymentsConfig, type JSONProduct, readProducts } from './payments/paymentsConfig.js';
import { handleTwirpError } from './twirp-error-handler.js';

export class AppVersionUploader {
  readonly #cmd: DevvitCommand;
  readonly #verbose: boolean;

  readonly #appVersionClient = createAppVersionClient();

  constructor(cmd: DevvitCommand, { verbose }: { verbose: boolean }) {
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
    bundles: Bundle[],
    preventSubredditCreation: boolean = false
  ): Promise<AppVersionInfo> {
    const about = await this.#getReadmeContent();

    // Sync and upload assets
    const assetUploader = new AssetUploader(this.#cmd, appInfo.appSlug, { verbose: this.#verbose });
    const { assetMap, webViewAssetMap } = await assetUploader.syncAssets();

    let products: JSONProduct[] | undefined;

    try {
      products = await readProducts(this.#cmd.project.root);
    } catch (err) {
      throw new Error(
        `An error occurred when reading and validating ${PRODUCTS_JSON_FILE}: 

  ${StringUtil.caughtToString(err, 'message')}
  
Please refer to https://developers.reddit.com/docs/capabilities/payments for more details.`
      );
    }

    await Promise.all(
      // Dump these in the assets fields of the bundles
      bundles.map(async (bundle) => {
        bundle.assetIds = assetMap ?? {};
        bundle.webviewAssetIds = webViewAssetMap ?? {};

        if (products) {
          this.#verifyThatDevvitPackagesVersionsMatch(bundle, [
            '@devvit/payments',
            '@devvit/public-api',
          ]);
          bundle.paymentsConfig = getPaymentsConfig(this.#cmd.project.mediaDir, bundle, products);
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
        preventPlaytestSubredditCreation: preventSubredditCreation,
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
    const readmeFileName = 'README.md';
    const readmePath = (await glob('*.md', { cwd: this.#cmd.project.root })).filter(
      (file) => file.toLowerCase() === readmeFileName.toLowerCase()
    );

    if (readmePath.length > 1) {
      this.#cmd.log(
        `Found multiple '${readmeFileName}'-looking files - going with '${readmePath[0]}'`
      );
    }

    if (readmePath.length >= 1) {
      const aboutBuffer = await fsp.readFile(path.join(this.#cmd.project.root, readmePath[0]));
      const utf8String = decodeAsUtf8(aboutBuffer);
      if (utf8String) {
        // we're UTF-8, no worries
        return utf8String;
      }

      // Check if we're UTF-16
      const utf16String = decodeAsUtf16(aboutBuffer);
      if (utf16String) {
        return utf16String;
      }

      this.#cmd.error(
        `${readmePath[0]} is not UTF-8 or UTF-16 encoded. Please convert it to UTF-8 or UTF-16.`
      );
    } else {
      this.#cmd.log(
        `Couldn't find ${readmeFileName}, so not setting an 'about' for this app version (you can update this later)`
      );
      return '';
    }
  }

  /**
   * Verify that the versions of the specified Devvit packages match in the bundle.
   * @param bundle The bundle to check.
   * @param packageNames The names of the Devvit packages to check.
   * @throws Error if the versions do not match.
   */
  #verifyThatDevvitPackagesVersionsMatch(
    bundle: Bundle,
    packageNames: `@devvit/${string}`[]
  ): void {
    const uniqueVersions = new Set(
      packageNames.map((pkgName) => bundle.buildInfo?.dependencies?.[pkgName])
    );

    if (uniqueVersions.size !== 1) {
      throw new Error(
        `The versions of the required packages do not match. Please ensure that all packages have the same version: ${packageNames.join(
          ', '
        )}`
      );
    }
  }
}
