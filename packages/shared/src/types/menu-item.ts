export type MenuItemLocation = 'subreddit' | 'post' | 'comment';

export type MenuItemOnPressEvent = {
  /** The location where the menu item was pressed */
  location: MenuItemLocation;
  /**
   * The ID of subreddit, post, or comment that the menu item was pressed;
   * includes Thing ID prefix:
   * - t1_ - comment
   * - t5_ - subreddit
   * - t3_ - post
   */
  targetId: string;
};
