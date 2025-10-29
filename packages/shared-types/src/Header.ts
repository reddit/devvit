/**
 * Metadata header key. Every system header should start with "devvit-".
 *
 * Synchronize to headers.md.
 */
export const Header = Object.freeze({
  Actor: 'devvit-actor',
  App: 'devvit-app',
  AppUser: 'devvit-app-user',
  AppViewerAuthToken: 'devvit-app-viewer-authorization',
  Caller: 'devvit-caller',
  CallerPortID: 'devvit-caller-port-id',
  Canary: 'devvit-canary',
  Debug: 'devvit-debug',
  GQLHost: 'devvit-gql-host',
  Installation: 'devvit-installation',
  ModPermissions: 'devvit-mod-permissions',
  Post: 'devvit-post',
  PostAuthor: 'devvit-post-author',
  PostData: 'devvit-post-data',
  R2Auth: 'devvit-sec-authorization',
  R2Host: 'devvit-r2-host',
  RemoteHostname: 'devvit-remote-hostname',
  SettingsUri: 'devvit-sec-settings-uri',
  StreamID: 'devvit-stream-id',
  Subreddit: 'devvit-subreddit',
  SubredditName: 'devvit-subreddit-name',
  TraceID: 'devvit-trace-id',
  User: 'devvit-user',
  Username: 'devvit-user-name',
  UserSnoovatarUrl: 'devvit-user-snoovatar-url',
  UserAgent: 'devvit-user-agent',
  Version: 'devvit-version',
  Language: 'devvit-accept-language',
  Timezone: 'devvit-accept-timezone',
  Traceparent: 'traceparent',
  AppDependencies: 'devvit-app-dependencies',
});
export type Header = (typeof Header)[keyof typeof Header];

/** Prefix common to all Devvit system headers. */
export const headerPrefix: string = 'devvit-';

/** See DevvitGlobal and ContextDebugInfo. */
export const enum AppDebug {
  /** Enable debug logging for blocks. */
  Blocks = 'blocks',
  /**
   * Log the entire reified blocks JSX/XML tree on each render. Eg:
   *
   *   <hstack><text>hi world</text></hstack>
   */
  EmitSnapshots = 'emitSnapshots',
  /** Log app state changes. */
  EmitState = 'emitState',
  /** Enable debug logging for realtime and useChannel() hook. */
  Realtime = 'realtime',
  /** Enable runtime and dispatcher logging. */
  Runtime = 'runtime',
  /** Enable debug logging for devvit-surface and dispatcher. */
  Surface = 'surface',
  /** Enable debug logging for the useAsync() hook family. */
  UseAsync = 'useAsync',
  /** Enable debug logging for payments APIs */
  Payments = 'payments',
  /** Enable bootstrap logging */
  Bootstrap = 'bootstrap',
  /** WebView debug logs */
  WebView = 'webView',
}
