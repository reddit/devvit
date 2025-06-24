import type { AppVersionInfo } from '@devvit/protos/community.js';
import { DevvitVersion } from '@devvit/shared-types/Version.js';

export function getVersionByNumber(version: string, appVersions: AppVersionInfo[]): AppVersionInfo {
  const latest = getLatestVersion(appVersions);
  if (version === 'latest') {
    return latest;
  } else if (version === 'playtest' || version === 'prerelease') {
    const prerelease = getLatestPrereleaseVersion(appVersions);
    if (!prerelease) {
      throw new Error(`Could not find a prerelease version`);
    }
    return prerelease;
  } else {
    const neVer = DevvitVersion.fromString(version);

    const appVersion = appVersions.find((appVer) => {
      return (
        appVer.majorVersion === neVer.major &&
        appVer.minorVersion === neVer.minor &&
        appVer.patchVersion === neVer.patch &&
        appVer.prereleaseVersion === neVer.prerelease
      );
    });
    if (!appVersion) {
      throw new Error(`Could not find version ${version}`);
    }

    if (appVersion !== latest && !appVersion.prereleaseVersion) {
      const latestVersionString = `${latest.majorVersion}.${latest.minorVersion}.${latest.patchVersion}`;
      const foundVersionString = `${appVersion.majorVersion}.${appVersion.minorVersion}.${appVersion.patchVersion}`;
      console.warn(
        `Warning: You're installing version ${foundVersionString}, but the latest version available is ${latestVersionString}`
      );
    }

    return appVersion;
  }
}

function getLatestVersion(appVersions: AppVersionInfo[]): AppVersionInfo {
  return appVersions
    .filter((appVersion) => {
      // Remove all appVersions that have a prerelease chunk - latest is _never_ a prerelease
      return !appVersion.prereleaseVersion;
    })
    .map((appVersion) => {
      // Make a DevvitVersion object for each app version, and tie them together
      return {
        appVersion,
        devvitVersion: new DevvitVersion(
          appVersion.majorVersion,
          appVersion.minorVersion,
          appVersion.patchVersion,
          appVersion.prereleaseVersion
        ),
      };
    })
    .sort((a, b) => {
      // Sort based on devvitVersion - descending order
      return b.devvitVersion.compare(a.devvitVersion);
    })[0].appVersion; // return the appVersion of the one that sorted to the top (is latest)
}

function getLatestPrereleaseVersion(appVersions: AppVersionInfo[]): AppVersionInfo | undefined {
  const prereleaseVersions = appVersions.filter((appVersion) => {
    return !!appVersion.prereleaseVersion;
  });
  if (prereleaseVersions.length === 0) {
    return undefined;
  }
  return prereleaseVersions
    .map((appVersion) => {
      // Make a DevvitVersion object for each app version, and tie them together
      return {
        appVersion,
        devvitVersion: new DevvitVersion(
          appVersion.majorVersion,
          appVersion.minorVersion,
          appVersion.patchVersion,
          appVersion.prereleaseVersion
        ),
      };
    })
    .sort((a, b) => {
      // Sort based on devvitVersion - descending order
      return b.devvitVersion.compare(a.devvitVersion);
    })[0].appVersion; // return the appVersion of the one that sorted to the top (is latest)
}
