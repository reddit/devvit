/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */
import { Devvit } from '../Devvit.js';

export type ParsedDevvitUserAgent =
  | {
      company: 'Reddit';
      platform: 'iOS';
      rawVersion: string;
      versionNumber: number;
    }
  | {
      company: 'Reddit';
      platform: 'Android';
      rawVersion: string;
      versionNumber: number;
    }
  | {
      company: 'Reddit';
      platform: 'Shreddit';
      rawVersion: string;
    }
  | {
      company: 'Reddit';
      platform: 'Play';
      rawVersion: string;
    };

const getVersionNumberFromRawVersion = (rawVersion: string): number | undefined => {
  const versionNumber = Number(rawVersion.trim().split('.').pop());
  return isNaN(versionNumber) ? undefined : versionNumber;
};

export const parseDevvitUserAgent = (input: string): ParsedDevvitUserAgent | undefined => {
  const [company, platform, rawVersion] = input.trim().split(';');

  if (!company || !platform || !rawVersion) {
    console.warn(`Received a malformed devvit-user-agent! Received: '${input}'`);
    return;
  }

  if (company !== 'Reddit') {
    console.warn(`Received unknown company name in user agent! Received: '${input}'`);
    return;
  }

  if (platform === 'iOS') {
    const versionNumber = getVersionNumberFromRawVersion(rawVersion);

    if (versionNumber === undefined) {
      console.warn(`Could not parse version number from user agent! Received: '${input}'`);
      return;
    }

    return {
      company: 'Reddit',
      platform: 'iOS',
      rawVersion,
      versionNumber,
    };
  }

  if (platform === 'Android') {
    const versionNumber = getVersionNumberFromRawVersion(rawVersion);

    if (versionNumber === undefined) {
      console.warn(`Could not parse version number from user agent! Received: '${input}'`);
      return;
    }

    return {
      company: 'Reddit',
      platform: 'Android',
      rawVersion,
      versionNumber,
    };
  }

  if (platform === 'Shreddit') {
    return {
      company: 'Reddit',
      platform: 'Shreddit',
      rawVersion,
    };
  }

  if (platform === 'Play') {
    return {
      company: 'Reddit',
      platform: 'Play',
      rawVersion,
    };
  }

  console.warn(`Received unknown platform:`, platform);
};

export const shouldShowUpgradeAppScreen = (
  parsedDevvitUserAgent: ParsedDevvitUserAgent | undefined
): boolean => {
  // If we couldn't parse, default to trying to render the app
  if (!parsedDevvitUserAgent) {
    console.warn(
      `Could not parse devvit-user-agent! Received: '${JSON.stringify(parsedDevvitUserAgent)}'`
    );
    return false;
  }

  if (parsedDevvitUserAgent.platform === 'Android') {
    return parsedDevvitUserAgent.versionNumber < 1819908;
  }

  if (parsedDevvitUserAgent.platform === 'iOS') {
    return parsedDevvitUserAgent.versionNumber < 614973;
  }

  // Default to trying to render since we couldn't explicitly get the version number
  return false;
};

const getUpgradeLinkForPlatform = (
  platform: ParsedDevvitUserAgent['platform']
): string | undefined => {
  switch (platform) {
    case 'Android':
      return 'https://play.google.com/store/apps/details?id=com.reddit.frontpage';
    case 'iOS':
      return 'https://apps.apple.com/us/app/reddit/id1064216828';
    case 'Play':
    case 'Shreddit':
      break;
    default:
      console.error(`No upgrade link for platform: ${platform satisfies never}`);
  }
};

export const UpgradeAppComponent: Devvit.BlockComponent<{
  platform: ParsedDevvitUserAgent['platform'];
}> = ({ platform }, context) => {
  return (
    <blocks>
      <vstack alignment="middle center" height={100} width={100}>
        <vstack maxWidth={'300px'} gap="large" alignment="middle center">
          <vstack gap="medium" alignment="middle center">
            <image imageHeight={100} imageWidth={100} url="https://i.redd.it/p1vmc5ulmpib1.png" />
            <text size="large" weight="bold" wrap alignment="center">
              Uh oh, the app you're trying to use requires the latest version of Reddit. Please
              upgrade your app to continue.
            </text>
          </vstack>
          <hstack alignment="middle center">
            <button
              onPress={() => {
                const upgradeLink = getUpgradeLinkForPlatform(platform);
                if (upgradeLink) {
                  context.ui.navigateTo(upgradeLink);
                } else {
                  console.warn(`No upgrade link found for platform:`, platform);
                }
              }}
            >
              Upgrade
            </button>
          </hstack>
        </vstack>
      </vstack>
    </blocks>
  );
};

// A builder to make a component so that we don't have to rename `ui-request.handler.ts` to `.tsx`
// Not that there's really anything wrong with that, but I like the separation of concerns since
// we also has to set the pragma at the top of files that use Devvit-y stuff
export const makeUpgradeAppComponent = (platform: ParsedDevvitUserAgent['platform']) => () => (
  <UpgradeAppComponent platform={platform} />
);
