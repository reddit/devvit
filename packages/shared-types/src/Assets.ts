/**
 * A map from the local file path of a media asset ("assets/file.png"), to either:
 * - If the relevant app version has finished uploading all its assets: its
 *     publicly accessible URL (https://i.redd.it/<ID>.png)
 * - If the relevant app version has not uploaded all its assets, or this is
 *     from the CLI which doesn't know the public URLs for any assets: the
 *     asset ID for the file as saved in dev-portal (NOT the media service ID).
 *     UUIDv4.
 * Note that this may be `undefined` if the bundle is old and/or there are no
 * assets associated with the app.
 */
export type AssetMap = { [path: string]: string };

// List of allowed asset extensions. Note that this should not be used as definitive proof that
// an asset is valid, as it is possible to spoof the extension of a file. This is just a quick
// check to make sure the file is probably an image.
export const ALLOWED_ASSET_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

export const KILOBYTE = 1024;
export const MEGABYTE = KILOBYTE * KILOBYTE;
export const GIGABYTE = MEGABYTE * KILOBYTE;
export const MAX_ASSET_FOLDER_SIZE_BYTES = GIGABYTE;
export const MAX_ASSET_GIF_SIZE = 40 * MEGABYTE;
export const MAX_ASSET_NON_GIF_SIZE = 20 * MEGABYTE;

export function prettyPrintSize(bytes: number): string {
  const sizeNames = ['B', 'KB', 'MB', 'GB', 'TB'];

  let curSizeName = 0;
  let remainingBytes = bytes;
  while (remainingBytes >= KILOBYTE && curSizeName < sizeNames.length - 1) {
    curSizeName++;
    remainingBytes = remainingBytes / KILOBYTE;
  }

  const prettyByteCount = Math.round(Math.floor(remainingBytes * 100)) / 100;
  return `${prettyByteCount}${sizeNames[curSizeName]}`;
}
