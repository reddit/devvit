export type PluginSettings = {
  /** Whether the plugin is enabled */
  enabled: boolean;
};

export type Configuration = {
  /** Allows your app to use the HTTP/Fetch API */
  http?: PluginSettings | boolean | { domains: string[] };
  /** Allows your app to use the reddit API */
  redditAPI?: PluginSettings | boolean;
  /** Allows your app to use the Key-Value Store */
  kvStore?: PluginSettings | boolean;
  /** Allows your app to use the Redis Plugin */
  redis?: PluginSettings | boolean;
  /** Allows media uploads from apps */
  media?: PluginSettings | boolean;
  /** Allows using ModLog API */
  modLog?: PluginSettings | boolean;
  /** Allows your app to use the Realtime Plugin */
  realtime?: PluginSettings | boolean;
  /** Allows your app to call Reddit APIs on behalf of the User */
  userActions?: PluginSettings | boolean;
  /**
   * Allows your app to use the Payments Plugin
   * @internal
   */
  payments?: boolean;
};
