import type { Devvit } from '../devvit/Devvit.js';

export type MenuItemLocation = 'subreddit' | 'post' | 'comment';

export type MenuItemUserType = 'loggedOut' | 'moderator';

/**
 * You can use the "currentApp" filter to only display the menu item on custom posts that were created by your app.
 */
export type MenuItemPostFilter = 'currentApp';

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

export type MenuItem = {
  /** The label of the menu item */
  label: string;
  /** An optional description for the menu item */
  description?: string;
  /** The location(s) where the menu item should be displayed */
  location: MenuItemLocation | MenuItemLocation[];
  /**
   * @experimental
   * The filter that applies to post menu items and has no effect on non-post actions
   * */
  postFilter?: MenuItemPostFilter;
  /** The user type(s) that the menu item should be displayed for */
  forUserType?: MenuItemUserType | MenuItemUserType[];
  /** A function that is called when the menu item is pressed */
  onPress: (event: MenuItemOnPressEvent, context: Devvit.Context) => void | Promise<void>;
};
