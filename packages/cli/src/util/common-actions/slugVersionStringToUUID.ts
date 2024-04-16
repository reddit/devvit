import type { AppClient, AppVersionInfo, FullAppInfo } from '@devvit/protos';
import { GetAppBySlugRequest } from '@devvit/protos';
import { DevvitVersion } from '@devvit/shared-types/Version.js';

export async function getInfoForSlugString(
  slugVersionString: string,
  appClient: AppClient
): Promise<{ appInfo: FullAppInfo; appVersion: AppVersionInfo }> {
  // Split this out into the slug and the optional version identifier
  const split = slugVersionString.split('@');
  const slug = split[0];
  let version = 'latest';
  if (split.length === 2) {
    version = split[1];
  } else if (split.length > 2) {
    throw Error(`Invalid app@version string given: ${slugVersionString}`);
  }

  let appInfo: FullAppInfo;
  try {
    appInfo = await appClient.GetBySlug(GetAppBySlugRequest.fromPartial({ slug }));
  } catch (e) {
    throw new Error(`${e}. Please run 'devvit upload' and try your command again.`);
  }

  return {
    appInfo: appInfo,
    appVersion: getCorrectVersion(version, appInfo.versions),
  };
}

export async function slugVersionStringToUUID(
  slugVersionString: string,
  appClient: AppClient
): Promise<string> {
  return (await getInfoForSlugString(slugVersionString, appClient)).appVersion.id;
}

function getCorrectVersion(version: string, appVersions: AppVersionInfo[]): AppVersionInfo {
  const latest = getLatestVersion(appVersions);
  if (version === 'latest') {
    return latest;
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
