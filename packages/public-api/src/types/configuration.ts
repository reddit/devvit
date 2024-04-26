export type PluginSettings = {
  /** Whether the plugin is enabled */
  enabled: boolean;
};

export type Configuration = {
  /** Allows your app to use the HTTP/Fetch API */
  http?: PluginSettings | boolean;
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
};
