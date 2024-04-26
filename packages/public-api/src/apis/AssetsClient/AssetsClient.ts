import type { AssetResolver, Metadata } from '@devvit/protos';
import type { AssetMap } from '@devvit/shared-types/Assets.js';

export class AssetsClient {
  readonly #metadata: Metadata;
  readonly #assetsPluginFetcher: () => AssetResolver;

  constructor(metadata: Metadata, assetsPluginFetcher: () => AssetResolver) {
    this.#metadata = metadata;
    this.#assetsPluginFetcher = assetsPluginFetcher;
  }

  /**
   * Gets the public URLs for an asset.
   * @param assetPath A path, relative to the 'assets/' folder.
   * @returns The public URL for that asset (https://i.redd.it/<id>.<ext>)
   */
  async getURL(assetPath: string): Promise<string>;
  /**
   * Gets the public URLs for multiple assets.
   * @param assetPaths An array of paths, relative to the 'assets/' folder.
   * @returns A map of each asset path to its public URL (https://i.redd.it/<id>.<ext>)
   */
  async getURL(assetPaths: string[]): Promise<NonNullable<AssetMap>>;
  /**
   * Takes one or more asset names, relative to the 'assets/' folder, and returns either the
   * public URL for that one asset, or a map of each asset name to its URL.
   * @param assetPathOrPaths - Either the path you need the public URL for, or an array of paths.
   * @returns Either the public URL for the one asset you asked for, or a map of assets to their URLs.
   */
  async getURL(assetPathOrPaths: string | string[]): Promise<string | NonNullable<AssetMap>> {
    if (typeof assetPathOrPaths === 'string') {
      return this.#getURL(assetPathOrPaths);
    }
    return this.#getURLs(assetPathOrPaths);
  }

  async #getURL(assetPath: string): Promise<string> {
    // Try and short circuit using the locally available assets list if possible
    // @ts-ignore - it doesn't know what globalThis is
    const localUrl = globalThis?.devvit?.config?.assets?.[assetPath];
    if (localUrl) {
      return localUrl;
    }

    const response = await this.#assetsPluginFetcher().GetAssetURL(
      { path: assetPath },
      this.#metadata
    );
    if (!response.found) {
      throw new Error(`Could not load the URL for asset ${assetPath}`);
    }
    return response.url!; // If found is true, this must be set
  }

  async #getURLs(assetPaths: string[]): Promise<NonNullable<AssetMap>> {
    const retval: Record<string, string> = {};
    let missingPaths: string[] = [];

    // Try and short circuit using the locally available assets list if possible, keeping a list
    // of all the paths that we couldn't find locally to ask the backend about
    // @ts-ignore - it doesn't know what globalThis is
    const localAssets: AssetMap = globalThis?.devvit?.config?.assets;
    if (localAssets) {
      for (const path of assetPaths) {
        if (localAssets[path]) {
          retval[path] = localAssets[path];
        } else {
          missingPaths.push(path);
        }
      }
    } else {
      // No local assets - everything is missing
      missingPaths = assetPaths;
    }

    if (missingPaths.length === 0) {
      // Found everything - don't bother the backend
      return retval;
    }

    const response = await this.#assetsPluginFetcher().GetAssetURLs(
      { paths: missingPaths },
      this.#metadata
    );
    missingPaths = [];
    for (const [path, result] of Object.entries(response.urls)) {
      if (result.found) {
        // This will only contain one value when being used like this, because we don't allow globbing
        retval[path] = result.paths[0];
      } else {
        missingPaths.push(path);
      }
    }

    if (missingPaths.length > 0) {
      throw new Error(
        `The following assets were missing from the assets list: ${missingPaths.join(', ')}`
      );
    }

    return retval;
  }
}
