import type { Devvit } from '../devvit/Devvit.js';

export type CustomPostType = {
  /** The name of the custom post type */
  name: string;
  /** A description of the custom post type */
  description?: string;
  /** The fixed height of the post, defaults to 'regular' */
  height?: Devvit.Blocks.RootHeight;
  /** A function component that renders the custom post */
  render: Devvit.CustomPostComponent;
};
