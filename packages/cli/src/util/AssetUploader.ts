import fsp from 'node:fs/promises';
import path from 'node:path';

import type {
  MediaSignature,
  MediaSignatureStatus,
  UploadNewMediaResponse,
} from '@devvit/protos/community.js';
import {
  ALLOWED_ASSET_EXTENSIONS,
  ASSET_DIRNAME,
  type AssetMap,
  MAX_ASSET_FOLDER_SIZE_BYTES,
  MAX_ASSET_GIF_SIZE,
  MAX_ASSET_NON_GIF_SIZE,
  prettyPrintSize,
  WEB_VIEW_ASSET_DIRNAME,
} from '@devvit/shared-types/Assets.js';
import { ASSET_HASHING_ALGO, ASSET_UPLOAD_BATCH_SIZE } from '@devvit/shared-types/constants.js';
import { ux } from '@oclif/core';
import { createHash } from 'crypto';
import { default as tinyglob } from 'tiny-glob';

import { dirExists } from '../util/files.js';
import { createAppClient } from './clientGenerators.js';
import type { ProjectCommand } from './commands/ProjectCommand.js';

type MediaSignatureWithContents = MediaSignature & {
  contents: Uint8Array;
};

export class AssetUploader {
  readonly #cmd: ProjectCommand;
  readonly #verbose: boolean;

  readonly #appClient = createAppClient();

  readonly #appSlug: string;

  constructor(cmd: ProjectCommand, appSlug: string, { verbose }: { verbose: boolean }) {
    this.#cmd = cmd;
    this.#verbose = verbose;
    this.#appSlug = appSlug;
  }

  /**
   * Checks if there are any new assets to upload, and if there are, uploads them.
   * Returns a map of asset names to their asset IDs.
   * Can throw an exception if the app's assets exceed our limits.
   *
   * If present, WebView assets will also be synced but will not be included in
   * the asset map.
   */
  async syncAssets(): Promise<{
    assetMap?: AssetMap;
    webViewAssetMap?: AssetMap;
  }> {
    const [regularAssets, webViewAssets] = await Promise.all([
      this.#getAssets(ASSET_DIRNAME, ALLOWED_ASSET_EXTENSIONS),
      this.#getAssets(WEB_VIEW_ASSET_DIRNAME, [], true),
    ]);

    // Return early if no assets
    if (regularAssets.length + webViewAssets.length === 0) {
      return {};
    }

    // Do some rough client-side asset verification - it'll be more robust on
    // the server side of things, but let's help "honest" users out early
    const totalSize =
      regularAssets.reduce((sum, a) => sum + a.size, 0) +
      webViewAssets.reduce((sum, a) => sum + a.size, 0);

    if (totalSize > MAX_ASSET_FOLDER_SIZE_BYTES) {
      this.#cmd.error(
        `Your assets folder is too big - you've got ${prettyPrintSize(
          totalSize
        )} of assets, which is more than the ${prettyPrintSize(
          MAX_ASSET_FOLDER_SIZE_BYTES
        )} total allowed.`
      );
    }

    // regular assets go to Media Service
    const assetMap = await this.#processRegularAssets(regularAssets);
    // webroot assets go to WebView storage
    const webViewAssetMap = await this.#processWebViewAssets(webViewAssets);

    return { assetMap, webViewAssetMap };
  }

  async #getAssets(
    folder: string,
    allowedExtensions: string[] = [],
    webViewAssets: boolean = false
  ): Promise<MediaSignatureWithContents[]> {
    if (!(await dirExists(path.join(this.#cmd.projectRoot, folder)))) {
      // Return early if there isn't an assets directory
      return [];
    }

    const assetsPath = path.join(this.#cmd.projectRoot, folder);
    const assetsGlob = path
      .join(assetsPath, '**', '*')
      // Note: tiny-glob *always* uses `/` as its path separator, even on Windows, so we need to
      // replace whatever the system path separator is with `/`
      .replaceAll(path.sep, '/');
    const assets = (
      await tinyglob(assetsGlob, {
        filesOnly: true,
        absolute: true,
      })
    ).filter(
      (asset) => allowedExtensions.length === 0 || allowedExtensions.includes(path.extname(asset))
    );
    return await Promise.all(
      assets.map(async (asset) => {
        const filename = path.relative(assetsPath, asset).replaceAll(path.sep, '/');
        const file = await fsp.readFile(asset);
        const size = Buffer.byteLength(file);
        const contents = new Uint8Array(file);

        const hash = createHash(ASSET_HASHING_ALGO).update(file).digest('hex');
        return {
          filePath: filename,
          size,
          hash,
          isWebviewAsset: webViewAssets,
          contents,
        };
      })
    );
  }

  async #processRegularAssets(assets: MediaSignatureWithContents[]): Promise<AssetMap> {
    // early out to avoid logging if empty
    if (assets.length === 0) {
      return {};
    }

    // Verify asset file sizes are within limits
    for (const asset of assets) {
      if (asset.filePath.endsWith('.gif') && asset.size > MAX_ASSET_GIF_SIZE) {
        this.#cmd.error(
          `Asset ${asset.filePath} is too large - gifs can't be more than ${prettyPrintSize(
            MAX_ASSET_GIF_SIZE
          )}.`
        );
      }
      if (asset.size > MAX_ASSET_NON_GIF_SIZE) {
        this.#cmd.error(
          `Asset ${asset.filePath} is too large - images can't be more than ${prettyPrintSize(
            MAX_ASSET_NON_GIF_SIZE
          )}.`
        );
      }
    }

    ux.action.start(`Checking for new assets to upload`);
    const assetMap = await this.#uploadNewAssets(assets);
    ux.action.stop(`Found ${assets.length} new asset${assets.length === 1 ? '' : 's'}.`);

    return assetMap;
  }

  async #processWebViewAssets(assets: MediaSignatureWithContents[]): Promise<AssetMap> {
    // early out to avoid logging if empty
    if (assets.length === 0) {
      return {};
    }

    ux.action.start(`Checking for new WebView assets to upload`);
    const assetMap = await this.#uploadNewAssets(assets, true);
    ux.action.stop(`Found ${assets.length} new WebView asset${assets.length === 1 ? '' : 's'}.`);

    // only return the html files for the WebView assets
    return Object.keys(assetMap).reduce<AssetMap>((map, assetPath) => {
      if (assetPath.match(/\.htm(l)?$/)) {
        map[assetPath] = assetMap[assetPath];
      }
      return map;
    }, {});
  }

  async #uploadNewAssets(
    assets: MediaSignatureWithContents[],
    webViewAsset: boolean = false
  ): Promise<AssetMap> {
    const { statuses } = await this.#appClient.CheckIfMediaExists({
      id: undefined,
      slug: this.#appSlug,
      signatures: assets.map((a) => ({
        size: a.size,
        hash: a.hash,
        filePath: a.filePath,
        isWebviewAsset: webViewAsset,
      })),
    });

    const webViewMsg = webViewAsset ? 'WebView ' : '';
    ux.action.start(`Checking for new ${webViewMsg}assets`);
    const { newAssets, duplicateAssets, existingAssets } = await this.#mapAssets(assets, statuses);
    ux.info(`Found ${assets.length} ${webViewMsg}assets (${newAssets.length} unique new assets)`);
    if (this.#verbose) {
      ux.info('New assets:');
      newAssets.forEach((asset) => {
        ux.info(` · ${asset.filePath}`);
      });
      ux.info('Duplicates of another asset already listed as new:');
      duplicateAssets.forEach((asset) => {
        ux.info(` · ${asset.filePath}`);
      });
      ux.info('Existing assets:');
      Object.entries(existingAssets).forEach(([path, id]) => {
        ux.info(` · ${path} (id: ${id})`);
      });
    }

    const assetMap: AssetMap = existingAssets;

    if (newAssets.length === 0) {
      ux.action.stop(`None found!`);
      return assetMap;
    }

    // Upload everything, giving back pairs of the assets & their upload response
    ux.action.start(`Uploading new ${webViewMsg}assets, ${newAssets.length} remaining`);
    let uploadResults: [MediaSignatureWithContents, UploadNewMediaResponse][] = [];
    try {
      // Do this in batches - we don't want to upload everything at once and
      // overwhelm the server
      while (newAssets.length > 0) {
        const batch = newAssets.splice(0, ASSET_UPLOAD_BATCH_SIZE);
        uploadResults = [
          ...uploadResults,
          ...(await Promise.all(
            batch.map(async (f) => {
              return [
                f,
                await this.#appClient.UploadNewMedia({
                  slug: this.#appSlug,
                  size: f.size,
                  hash: f.hash,
                  contents: f.contents,
                  webviewAsset: webViewAsset,
                  filePath: f.filePath,
                }),
              ] as [MediaSignatureWithContents, UploadNewMediaResponse];
            })
          )),
        ];
        ux.action.start(`Uploading new ${webViewMsg}assets, ${newAssets.length} remaining`);
      }
    } catch (err) {
      const error = err as Error;
      const msg = `Failed to upload ${webViewMsg}assets. (${error.message})`;
      ux.action.stop(msg);
      if (webViewAsset) {
        // don't fail on WebView uploads in case we just don't have the feature enabled
        ux.action.stop(msg);
        return {};
      } else {
        // otherwise exit
        ux.error(msg, { exit: 1 });
      }
    }

    ux.action.stop(`New ${webViewMsg}assets uploaded.`);

    return assets.reduce<{ [asset: string]: string }>((map, asset) => {
      const assetId =
        statuses.find((status) => status.filePath === asset.filePath)?.existingMediaId ??
        uploadResults.find(
          ([result]) => result.hash === asset.hash && result.size === asset.size
        )?.[1].assetId;
      if (assetId) {
        map[asset.filePath] = assetId;
      }
      return map;
    }, assetMap);
  }

  /**
   * Map assets into groups based on their server status:
   * - new assets
   * - duplicate assets
   * - existing assets
   */
  async #mapAssets(
    assets: MediaSignatureWithContents[],
    statuses: MediaSignatureStatus[]
  ): Promise<{
    newAssets: MediaSignatureWithContents[];
    duplicateAssets: MediaSignatureWithContents[];
    existingAssets: AssetMap;
  }> {
    const assetsByFilePath = Object.fromEntries(assets.map((a) => [a.filePath, a]));

    const newAssets: MediaSignatureWithContents[] = [];
    const duplicateAssets: MediaSignatureWithContents[] = [];
    const existingAssets: AssetMap = {};
    statuses.forEach((status) => {
      const asset = assetsByFilePath[status.filePath];
      if (!asset) {
        throw new Error(
          `Backend returned new asset with path ${status.filePath} that we don't know about..?`
        );
      }
      if (status.isNew) {
        // The user may have the same asset in multiple places, but we need to
        // only upload it once
        if (newAssets.find((a) => a.hash === asset.hash && a.size === asset.size)) {
          duplicateAssets.push(asset);
        } else {
          newAssets.push(asset);
        }
      } else {
        if (status.existingMediaId) {
          existingAssets[asset.filePath] = status.existingMediaId;
        } else {
          throw new Error(
            `Backend doesn't have an ID for ${status.filePath} but says it isn't new..?`
          );
        }
      }
    });

    return { newAssets, duplicateAssets, existingAssets };
  }
}
