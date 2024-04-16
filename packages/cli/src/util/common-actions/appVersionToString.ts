export function appVersionToString(
  version:
    | {
        majorVersion: number;
        minorVersion: number;
        patchVersion: number;
        prereleaseVersion?: number;
      }
    | undefined
): string {
  if (!version) {
    return 'unknown';
  }
  let retval = `${version.majorVersion}.${version.minorVersion}.${version.patchVersion}`;
  if (version.prereleaseVersion) {
    retval += `.${version.prereleaseVersion}`;
  }
  return retval;
}
