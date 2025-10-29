// to-do: move to service + CLI package.
// Do not use in @devvit/public-api. Protos not in externalized @devvit/protos
// barrel.

export const ACTOR_SRC_DIR = 'src';
export const ACTOR_SRC_PRIMARY_NAME = 'main';

/** payments stuff. */
export const PRODUCTS_JSON_FILE = 'products.json';

/**
 * The hashing algorithm used - pass this to `createHash`
 */
export const ASSET_HASHING_ALGO = 'sha256';

/**
 * The max number of subscribers allowed in a test subreddit (ie where a user can install an uploaded, private app
 * Determines if a PRIVATE (unpublished) version of an app can be installed or playtested
 *
 * TODO: turn this off before we go live - see DX-1336
 *  */
export const MAX_ALLOWED_SUBSCRIBER_COUNT = 200;

/**
 * How many assets to upload at once. Sending too many at once can cause the
 * server to become overwhelmed and start erroring clients out.
 * @type {number}
 */
export const ASSET_UPLOAD_BATCH_SIZE = 10;

export const REDDIT_OAUTH_COPY_PASTE_CLIENT_ID = 'TWTsqXa53CexlrYGBWaesQ';

/** All server endpoints must start with this prefix. */
export const apiPathPrefix = '/api/';

/** All unexposed APIs must start with this prefix. */
export const internalPathPrefix = '/internal/';

/** When an app's icon is present in the media assets list, it'll be with this special name. */
export const ICON_FILE_PATH = '$devvit_icon.png'; // Uses special characters intentionally to avoid conflicts with real asset paths

export const REDDIT_DISCORD_INVITE_URL = 'https://discord.gg/Cd43ExtEFS';
export const REDDIT_SUBREDDIT_URL = 'https://www.reddit.com/r/devvit';
