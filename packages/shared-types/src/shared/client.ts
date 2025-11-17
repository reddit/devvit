import type { NativeClientVersion } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';

/** The invoking client for the active request. */
export type Client = NativeClient;

/** The invoking Android or iOS client for the active request. */
export type NativeClient = { name: 'ANDROID' | 'IOS'; version: NativeClientVersion };

// to-do: Provide Shreddit version number in `@devvit/client` when unpacking
//        `BridgeContext`. Probably don't use `SemVer` here since it'd be
//        `version.version`.
// export type = WebClient {
//     name: 'WEB';
//     version: {
//       /** Major version. Eg, `1`. */
//       major: number;
//       /** Minor version. Eg, `2`. */
//       minor: number;
//       /** Patch version. Eg, `3`. */
//       patch: number;
//       /** Original version string. */
//       string: string;
//     };
//   }
