import fsp from 'node:fs/promises';
import path from 'node:path';

import { requireFromDir } from '@devvit/build-pack/esbuild/BuildInfoUtil.js';
import type {
  MediaSignature,
  MediaSignatureStatus,
  UploadNewMediaResponse,
} from '@devvit/protos/community.js';
import {
  ALLOWED_ASSET_EXTENSIONS,
  type AssetMap,
  MAX_ASSET_FOLDER_SIZE_BYTES,
  MAX_ASSET_GIF_SIZE,
  MAX_ASSET_NON_GIF_SIZE,
  prettyPrintSize,
} from '@devvit/shared-types/Assets.js';
import {
  ASSET_HASHING_ALGO,
  ASSET_UPLOAD_BATCH_SIZE,
  ICON_FILE_PATH,
} from '@devvit/shared-types/constants.js';
import { mapAsyncWithMaxConcurrency } from '@devvit/shared-types/mapAsyncWithMaxConcurrency.js';
import { clientVersionQueryParam } from '@devvit/shared-types/web-view-scripts-constants.js';
import { ux } from '@oclif/core';
import { createHash } from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { imageSize } from 'image-size';
import { JSDOM } from 'jsdom';
import { lookup } from 'mime-types';
import { default as tinyglob } from 'tiny-glob';

import { createAppClient } from './clientGenerators.js';
import type { DevvitCommand } from './commands/DevvitCommand.js';
import { dirExists } from './files.js';
import { retryAsync } from './retryAsync.js';

export const DEVVIT_JS_URL = 'https://webview.devvit.net/scripts/devvit.v1.min.js';
const DEFAULT_PARALLEL_UPLOADS = 7;

let PARALLEL_UPLOADS = parseInt(process.env['DEVVIT_PARALLEL_UPLOADS'] || '0');
if (isNaN(PARALLEL_UPLOADS) || PARALLEL_UPLOADS < 1) {
  PARALLEL_UPLOADS = DEFAULT_PARALLEL_UPLOADS;
}

type MediaSignatureWithContents = MediaSignature & {
  contents: Uint8Array;
};

type MediaSignatureWithContentsAndUploadInfo = MediaSignatureWithContents & {
  uploadUrl: string;
  uploadHeaders: { [key: string]: string };
};

type SyncAssetsResult = {
  assetMap: AssetMap | undefined;
  webViewAssetMap: AssetMap | undefined;
  iconAsset: string | undefined;
};

export class AssetUploader {
  readonly #cmd: DevvitCommand;
  readonly #verbose: boolean;

  readonly #appClient = createAppClient();

  readonly #appSlug: string;
  readonly #skipWebViewScriptInjection: boolean =
    !!process.env.DEVVIT_SKIP_WEB_VIEW_SCRIPT_INJECTION;

  constructor(cmd: DevvitCommand, appSlug: string, { verbose }: { verbose: boolean }) {
    this.#cmd = cmd;
    this.#verbose = verbose;
    this.#appSlug = appSlug;
    if (this.#skipWebViewScriptInjection) {
      this.#cmd.log('Skipping web view script injection.');
    }
  }

  /**
   * Checks if there are any new assets to upload, and if there are, uploads them.
   * Returns a map of asset names to their asset IDs.
   * Can throw an exception if the app's assets exceed our limits.
   *
   * If present, WebView assets will also be synced but will not be included in
   * the asset map.
   */
  async syncAssets(): Promise<SyncAssetsResult> {
    const clientVersion = readClientVersion(this.#cmd.project.root);

    const [regularAssets, webViewAssets] = await Promise.all([
      this.#cmd.project.mediaDir
        ? queryAssets(
            path.join(this.#cmd.project.root, this.#cmd.project.mediaDir),
            ALLOWED_ASSET_EXTENSIONS,
            'Media',
            clientVersion,
            this.#skipWebViewScriptInjection
          )
        : ([] as MediaSignatureWithContents[]),
      this.#cmd.project.clientDir
        ? queryAssets(
            path.join(this.#cmd.project.root, this.#cmd.project.clientDir),
            [],
            'Client',
            clientVersion,
            this.#skipWebViewScriptInjection
          )
        : ([] as MediaSignatureWithContents[]),
    ]);

    const iconAssetPath = this.#cmd.project.appConfig?.marketingAssets?.icon;
    let iconAssetDetails: MediaSignatureWithContents | undefined;
    if (iconAssetPath) {
      const iconAssetFullPath = path.join(this.#cmd.project.root, iconAssetPath);
      if (await dirExists(iconAssetFullPath)) {
        this.#cmd.error(`Icon asset path ${iconAssetPath} is a directory, not a file.`);
      }
      if (!(await fsp.stat(iconAssetFullPath)).isFile()) {
        this.#cmd.error(`Icon asset path ${iconAssetPath} does not point to a file.`);
      }
      const iconAssetContents = await fsp.readFile(iconAssetFullPath);
      const iconAssetSize = Buffer.byteLength(iconAssetContents);
      const iconAssetHash = createHash(ASSET_HASHING_ALGO)
        .update(new Uint8Array(iconAssetContents))
        .digest('hex');

      this.assertAssetCanBeAnIcon(iconAssetContents);

      iconAssetDetails = {
        filePath: ICON_FILE_PATH, // Use a placeholder path for the icon asset
        size: iconAssetSize,
        hash: iconAssetHash,
        contents: new Uint8Array(iconAssetContents),
        isWebviewAsset: false,
      };
      regularAssets.push(iconAssetDetails);
      webViewAssets.push(iconAssetDetails);
    }

    // Return early if no assets
    if (regularAssets.length + webViewAssets.length === 0) {
      return {
        assetMap: undefined,
        webViewAssetMap: undefined,
        iconAsset: undefined,
      };
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

    // We can parallelize this now, since regular vs webview assets go to different places
    const [assetMap, webViewAssetMap] = await Promise.all([
      // regular assets go to Media Service
      this.#processRegularAssets(regularAssets),
      // webroot assets go to WebView storage
      this.#processWebViewAssets(webViewAssets),
    ]);

    const retval: SyncAssetsResult = { assetMap, webViewAssetMap, iconAsset: undefined };
    if (iconAssetDetails) {
      retval.iconAsset = assetMap[ICON_FILE_PATH];
    }

    return retval;
  }

  async assertAssetCanBeAnIcon(data: Buffer): Promise<void> {
    // Verify the icon. It *must*:
    // - NOT be a GIF
    // - be square in shape
    // - be at least 256x256 pixels
    // - be at most 1024x1024 pixels
    // If it doesn't meet these requirements, we throw an error.
    // Also, we should warn the user in any of these cases:
    // - if the icon isn't a PNG
    // - if the icon is smaller than 1024x1024 pixels

    const fileTypeResult = await fileTypeFromBuffer(new Uint8Array(data));
    if (!fileTypeResult) {
      this.#cmd.error(`Icon asset is not a valid image.`);
    }
    if (fileTypeResult.mime === 'image/gif') {
      this.#cmd.error(`Icon asset cannot be a GIF.`);
    }

    const sizeResult = imageSize(new Uint8Array(data));
    if (!sizeResult) {
      this.#cmd.error(`Icon asset is not a valid image.`);
    }
    if (sizeResult.width !== sizeResult.height) {
      this.#cmd.error(
        `Icon asset must be square, but it is ${sizeResult.width}x${sizeResult.height}.`
      );
    }
    if (sizeResult.width < 256) {
      this.#cmd.error(
        `Icon asset must be at least 256x256 pixels, but it is ${sizeResult.width}x${sizeResult.height}.`
      );
    }
    if (sizeResult.width > 1024) {
      this.#cmd.error(
        `Icon asset can be at most 1024x1024 pixels, but it is ${sizeResult.width}x${sizeResult.height}.`
      );
    }

    // It's acceptable, but check if there's any warnings we should give the user
    if (fileTypeResult.mime !== 'image/png') {
      this.#cmd.warn(`Icon asset is not a PNG, but it will still be uploaded.`);
    }
    if (sizeResult.width < 1024) {
      this.#cmd.warn(
        `Icon asset is smaller than 1024x1024 pixels. Consider using a larger icon for better quality.`
      );
    }
    if (![1024, 512, 256].includes(sizeResult.width)) {
      this.#cmd.warn(
        `Icon asset is ${sizeResult.width}x${sizeResult.height}. Consider using a standard size (preferably 1024x1024) for better compatibility.`
      );
    }
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

    if (this.#verbose) {
      ux.action.start(`Checking for new assets to upload`);
    }
    const assetMap = await this.#uploadNewMediaAssets(assets);
    if (this.#verbose) {
      ux.action.stop(`Found ${assets.length} new asset${assets.length === 1 ? '' : 's'}.`);
    }

    return assetMap;
  }

  async #processWebViewAssets(assets: MediaSignatureWithContents[]): Promise<AssetMap> {
    // early out to avoid logging if empty
    if (assets.length === 0) {
      return {};
    }

    if (this.#verbose) {
      ux.action.start(`Checking for new WebView assets to upload`);
    }

    const assetMap = await this.#uploadNewWebViewAssets(assets);
    if (this.#verbose) {
      ux.action.stop(`Found ${assets.length} new WebView asset${assets.length === 1 ? '' : 's'}.`);
    }
    return assetMap;
  }

  async #uploadNewMediaAssets(assets: MediaSignatureWithContents[]): Promise<AssetMap> {
    const { statuses } = await this.#appClient.CheckIfMediaExists({
      id: undefined,
      slug: this.#appSlug,
      signatures: assets.map((a) => ({
        size: a.size,
        hash: a.hash,
        filePath: a.filePath,
        isWebviewAsset: false,
      })),
    });

    const { newAssets, duplicateAssets, existingAssets } = await this.#mapAssets(assets, statuses);
    if (this.#verbose) {
      ux.action.start(`Checking for new assets`);
      ux.info(`Found ${assets.length} assets (${newAssets.length} unique new assets)`);
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
      if (this.#verbose) {
        ux.action.stop(`None found!`);
      }
      return assetMap;
    }
    if (this.#verbose) {
      ux.action.stop();
    }

    // Upload everything, giving back pairs of the assets & their upload response
    if (this.#verbose) {
      ux.action.start(`Uploading new assets, ${newAssets.length} remaining`);
    }
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
                  webviewAsset: false,
                  filePath: f.filePath,
                }),
              ] as [MediaSignatureWithContents, UploadNewMediaResponse];
            })
          )),
        ];
        if (this.#verbose) {
          ux.action.start(`Uploading new assets, ${newAssets.length} remaining`);
        }
      }
    } catch (err) {
      const error = err as Error;
      const msg = `Failed to upload assets. (${error.message})`;
      if (this.#verbose) {
        ux.action.stop(msg);
      }

      this.#cmd.log(msg);
      ux.error(msg, { exit: 1 });
    }

    if (this.#verbose) {
      ux.action.stop(`New assets uploaded.`);
    }

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

  async #uploadNewWebViewAssets(assets: MediaSignatureWithContents[]): Promise<AssetMap> {
    const { statuses } = await this.#appClient.CheckIfMediaExists({
      id: undefined,
      slug: this.#appSlug,
      signatures: await Promise.all(
        assets.map(
          retryAsync(async (a) => {
            const fileType = await fileTypeFromBuffer(a.contents);
            return {
              size: a.size,
              hash: a.hash,
              filePath: a.filePath,
              isWebviewAsset: true,
              mimeType: fileType?.mime ?? (lookup(a.filePath) || 'application/octet-stream'),
            };
          })
        )
      ),
    });

    const { newAssets, duplicateAssets, existingAssets } = await this.#mapAssets(
      assets,
      statuses,
      true
    );
    if (this.#verbose) {
      ux.action.start(`Checking for new WebView assets`);
      ux.info(`Found ${assets.length} WebView assets (${newAssets.length} unique new assets)`);
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
      if (this.#verbose) {
        ux.action.stop(`None found!`);
      }
      return assetMap;
    }
    if (this.#verbose) {
      ux.action.stop();
    }

    // Upload everything, giving back pairs of the assets & their upload response
    let assetsRemaining = newAssets.length;
    let sizeRemaining = newAssets.reduce((sum, a) => sum + a.size, 0);
    const updateUploadMsg = (sizeUploaded: number) => {
      sizeRemaining -= sizeUploaded;
      assetsRemaining -= 1;
      ux.action.start(
        `Uploading new WebView assets, ${assetsRemaining} remaining (${prettyPrintSize(sizeRemaining)})`
      );
    };
    ux.action.start(
      `Uploading new WebView assets, ${assetsRemaining} remaining (${prettyPrintSize(sizeRemaining)})`
    );

    await mapAsyncWithMaxConcurrency(
      newAssets,
      async (newAsset) => {
        try {
          const resp = await fetch(newAsset.uploadUrl, {
            method: 'PUT',
            body: newAsset.contents,
            headers: newAsset.uploadHeaders,
          });
          if (!resp.ok) {
            const body = await resp.text();
            const msg = `Failed to upload WebView asset ${newAsset.filePath} - HTTP ${resp.status}:\n${body}`;
            ux.action.stop(msg);

            this.#cmd.error(msg);
          }
        } catch (e) {
          const error = e as Error;
          let errorMessage = error?.message;
          if (errorMessage === 'fetch failed') {
            // This is the most common, and least helpful error message. And it usually has a useful
            // cause, so go get that instead.
            errorMessage = (error.cause as Error)?.message || error.message;
          }
          const msg = `Failed to upload WebView asset ${newAsset.filePath}: ${errorMessage}`;
          this.#cmd.error(msg);
        }

        const uploadUrl = new URL(newAsset.uploadUrl);
        assetMap[newAsset.filePath] = uploadUrl.origin + uploadUrl.pathname;
        updateUploadMsg(newAsset.size);
      },
      PARALLEL_UPLOADS
    );

    ux.action.stop(`${newAssets.length} new WebView assets uploaded.`);
    ux.action.start(`Finishing upload`);

    return assetMap;
  }

  /**
   * Map assets into groups based on their server status:
   * - new assets
   * - duplicate assets
   * - existing assets
   */
  async #mapAssets(
    assets: MediaSignatureWithContents[],
    statuses: MediaSignatureStatus[],
    areWebviewAssets?: false
  ): Promise<{
    newAssets: MediaSignatureWithContents[];
    duplicateAssets: MediaSignatureWithContents[];
    existingAssets: AssetMap;
  }>;
  async #mapAssets(
    assets: MediaSignatureWithContents[],
    statuses: MediaSignatureStatus[],
    areWebviewAssets: true
  ): Promise<{
    newAssets: MediaSignatureWithContentsAndUploadInfo[];
    duplicateAssets: MediaSignatureWithContents[];
    existingAssets: AssetMap;
  }>;
  async #mapAssets(
    assets: MediaSignatureWithContents[],
    statuses: MediaSignatureStatus[],
    areWebviewAssets: boolean = false
  ): Promise<{
    newAssets: (MediaSignatureWithContents | MediaSignatureWithContentsAndUploadInfo)[];
    duplicateAssets: MediaSignatureWithContents[];
    existingAssets: AssetMap;
  }> {
    const assetsByFilePath = Object.fromEntries(assets.map((a) => [a.filePath, a]));

    const newAssets: (MediaSignatureWithContents | MediaSignatureWithContentsAndUploadInfo)[] = [];
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
          if (!areWebviewAssets) {
            newAssets.push(asset);
            return;
          }
          if (!status.uploadUrl) {
            throw new Error(
              `Backend didn't return an upload URL for new webview asset ${status.filePath} - this shouldn't happen, contact us!`
            );
          }
          newAssets.push({
            ...asset,
            uploadUrl: status.uploadUrl,
            uploadHeaders: status.uploadHeaders,
          });
        }
      } else {
        if (status.existingMediaId) {
          existingAssets[asset.filePath] = status.existingMediaId;
        } else {
          throw new Error(
            `Backend doesn't have an ID for ${status.filePath} but says it isn't new..? This shouldn't happen, contact the Devvit team!`
          );
        }
      }
    });

    return { newAssets, duplicateAssets, existingAssets };
  }
}

/**
 * Read assets from disk and transform them.
 *
 * Asset kind controls transform. Client (historically webroot/) is for web view
 * assets. Media (historically assets/) is for everything else.
 *
 * @internal
 */
export async function queryAssets(
  dir: string,
  allowedExtensions: readonly string[],
  assetKind: 'Client' | 'Media',
  clientVersionNum: string | undefined,
  skipWebViewScriptInjection: boolean
): Promise<MediaSignatureWithContents[]> {
  if (!(await dirExists(dir))) {
    // Return early if there isn't an assets directory
    return [];
  }

  const assetsGlob = path
    .join(dir, '**', '*')
    // Note: tiny-glob *always* uses `/` as its path separator, even on Windows, so we need to
    // replace whatever the system path separator is with `/`
    .replaceAll(path.sep, '/');
  const assets = (await tinyglob(assetsGlob, { filesOnly: true, absolute: true })).filter(
    (asset) => allowedExtensions.length === 0 || allowedExtensions.includes(path.extname(asset))
  );
  return await Promise.all(
    assets.map(async (asset) => {
      const filename = path.relative(dir, asset).replaceAll(path.sep, '/');
      let file = await fsp.readFile(asset);

      // If the webview assets is an HTML file, inject the Devvit analytics
      // script.
      if (assetKind === 'Client' && filename.match(/\.html?$/) && !skipWebViewScriptInjection) {
        file = transformHTMLBuffer(file, clientVersionNum);
      }

      const size = Buffer.byteLength(file);
      const contents = new Uint8Array(file);

      const hash = createHash(ASSET_HASHING_ALGO).update(new Uint8Array(file)).digest('hex');
      return {
        filePath: filename,
        size,
        hash,
        isWebviewAsset: assetKind === 'Client',
        contents,
      };
    })
  );
}

function readClientVersion(root: string): string | undefined {
  try {
    const pkg = requireFromDir(root, '@devvit/client/package.json');
    return (pkg as { version: string }).version;
  } catch {
    return;
  }
}

function transformHTMLBuffer(buf: Buffer, clientVersionNum: string | undefined): Buffer {
  const inStr = new TextDecoder('utf-8').decode(buf);
  const out = transformHTML(inStr, clientVersionNum);
  return Buffer.from(out);
}

export function transformHTML(str: string, clientVersionNum: string | undefined): string {
  const { document } = new JSDOM(str).window;

  // if no html tag, return early
  const htmlTag = document.querySelector('html');
  if (htmlTag == null) {
    return str;
  }

  const clientVersionQueryArg = clientVersionNum
    ? `${clientVersionQueryParam}=${clientVersionNum}`
    : '';
  const scriptTag = `<script src="${DEVVIT_JS_URL}?${clientVersionQueryArg}"></script>`;

  // if no head tag, create one after the html tag
  const headTag = document.querySelector('head');
  if (headTag == null) {
    htmlTag.insertAdjacentHTML('afterbegin', `<head>${scriptTag}</head>`); // eslint-disable-line no-unsanitized/method
  } else {
    headTag.insertAdjacentHTML('afterbegin', scriptTag); // eslint-disable-line no-unsanitized/method
  }

  return document.documentElement.outerHTML;
}
