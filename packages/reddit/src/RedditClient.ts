import { type FlairCsvResult, type JsonStatus, type Metadata } from '@devvit/protos';
import { context, getContextCache, setContextCache } from '@devvit/server';
import { Header } from '@devvit/shared-types/Header.js';
import { asT2ID, type T1ID, type T2ID, type T3ID, type T5ID } from '@devvit/shared-types/tid.js';
import { asT3ID, asTID, isT1ID, isT3ID } from '@devvit/shared-types/tid.js';

import type {
  AboutSubredditTypes,
  AddRemovalNoteOptions,
  AddWidgetData,
  BanUserOptions,
  BanWikiContributorOptions,
  CommentSubmissionOptions,
  CreateFlairTemplateOptions,
  CreateModNoteOptions,
  CreateWikiPageOptions,
  CrosspostOptions,
  DeleteNotesOptions,
  EditFlairTemplateOptions,
  GetCommentsByUserOptions,
  GetCommentsOptions,
  GetHotPostsOptions,
  GetModerationLogOptions,
  GetModNotesOptions,
  GetPageRevisionsOptions,
  GetPostsByUserOptions,
  GetPostsOptions,
  GetPostsOptionsWithTimeframe,
  GetPrivateMessagesOptions,
  GetSubredditUsersByTypeOptions,
  GetUserOverviewOptions,
  Listing,
  ModAction,
  ModeratorPermission,
  ModLogOptions,
  RemovalReason,
  SendPrivateMessageAsSubredditOptions,
  SendPrivateMessageOptions,
  SetPostFlairOptions,
  SetUserFlairBatchConfig,
  SetUserFlairOptions,
  SubmitPostOptions,
  SubredditInfo,
  SubredditLeaderboard,
  SubredditStyles,
  UpdatePageSettingsOptions,
  UpdateWikiPageOptions,
  Vault,
  WikiPageRevision,
  WikiPageSettings,
} from './models/index.js';
import {
  AboutLocations,
  Comment,
  Flair,
  FlairTemplate,
  getModerationLog,
  getSubredditInfoById,
  getSubredditInfoByName,
  getSubredditLeaderboard,
  getSubredditStyles,
  getVaultByAddress,
  getVaultByUserId,
  ModMailService,
  ModNote,
  Post,
  PrivateMessage,
  Subreddit,
  User,
  Widget,
  WikiPage,
} from './models/index.js';
import { getRedditApiPlugins } from './plugin.js';

const CACHE_KEY_CURRENT_USER = 'RedditClient.currentUser';

type GetSubredditUsersOptions = Omit<GetSubredditUsersByTypeOptions, 'type'>;

export type InviteModeratorOptions = {
  /** The name of the subreddit to invite the user to moderate */
  subredditName: string;
  /** The name of the user to invite as a moderator */
  username: string;
  /** The permissions to grant the user */
  permissions?: ModeratorPermission[];
};

export type MuteUserOptions = {
  /** The name of the subreddit to mute the user in */
  subredditName: string;
  /** The name of the user to mute */
  username: string;
  /** A mod note on why the user was muted. (optional) */
  note?: string;
};

/**
 * The Reddit API Client
 *
 * To use the Reddit API Client, add it to the plugin configuration at the top of the file.
 *
 * @example
 * ```ts
 * 
 * Devvit.configure({
 *    redditAPI: true,
 *    // other plugins
 * })

 * // use within one of our capability handlers e.g. Menu Actions, Triggers, Scheduled Job Type, etc
 * async (event, context) => {
 *     const subreddit = await context.reddit.getSubredditById(context.subredditId);
 *     context.reddit.submitPost({
 *       subredditName: subreddit.name,
 *       title: 'test post',
 *       text: 'test body',
 *     })
 *     // additional code
 * }
 * ```
 */
export class RedditClient {
  readonly #modMailService: ModMailService;

  constructor() {
    this.#modMailService = new ModMailService();
  }

  /**
   * Get ModMail API object
   *
   * @example
   * ```ts
   * await reddit.modMail.reply({
   *   body: "Here is my message",
   *   conversationId: "abcd42";
   * })
   * ```
   */
  get modMail(): ModMailService {
    return this.#modMailService;
  }

  /**
   * Gets a {@link Subreddit} object by ID
   *
   * @deprecated Use {@link getSubredditInfoById} instead.
   * @param {string} id - The ID (starting with t5_) of the subreddit to retrieve. e.g. t5_2qjpg
   * @returns {Promise<Subreddit>} A Promise that resolves a Subreddit object.
   * @example
   * ```ts
   * const memes = await reddit.getSubredditById('t5_2qjpg');
   * ```
   */
  getSubredditById(id: string): Promise<Subreddit | undefined> {
    return Subreddit.getById(asTID<T5ID>(id));
  }

  /**
   * Gets a {@link SubredditInfo} object by ID
   *
   * @param {string} id - The ID (starting with t5_) of the subreddit to retrieve. e.g. t5_2qjpg
   * @returns {Promise<SubredditInfo>} A Promise that resolves a SubredditInfo object.
   * @example
   * ```ts
   * const memes = await reddit.getSubredditInfoById('t5_2qjpg');
   * ```
   */
  getSubredditInfoById(id: string): Promise<SubredditInfo> {
    return getSubredditInfoById(id);
  }

  /**
   * Gets a {@link Subreddit} object by name
   *
   * @deprecated Use {@link getSubredditInfoByName} instead.
   * @param {string} name The name of a subreddit omitting the r/. This is case insensitive.
   * @returns {Promise<Subreddit>} A Promise that resolves a Subreddit object.
   * @example
   * ```ts
   * const askReddit = await reddit.getSubredditByName('askReddit');
   * ```
   */
  getSubredditByName(name: string): Promise<Subreddit> {
    return Subreddit.getByName(name);
  }

  /**
   * Gets a {@link SubredditInfo} object by name
   *
   * @param {string} name The name of a subreddit omitting the r/. This is case insensitive.
   * @returns {Promise<SubredditInfo>} A Promise that resolves a SubredditInfo object.
   * @example
   * ```ts
   * const askReddit = await reddit.getSubredditInfoByName('askReddit');
   * ```
   */
  getSubredditInfoByName(name: string): Promise<SubredditInfo> {
    return getSubredditInfoByName(name);
  }

  /**
   * Add a removal reason to a subreddit
   *
   * @param subredditName Name of the subreddit being removed.
   * @param options Options.
   * @param options.title The title of the removal reason.
   * @param options.message The message associated with the removal reason.
   * @example
   * ```ts
   * const newReason = await reddit.addSubredditRemovalReasons(
   *   'askReddit',
   *   {
   *     title: 'Spam',
   *     message: 'This is spam!'
   *   }
   * );
   * console.log(newReason.id)
   * ```
   *
   * @returns {string} Removal Reason ID
   */
  addSubredditRemovalReason(
    subredditName: string,
    options: { title: string; message: string }
  ): Promise<string> {
    return Subreddit.addRemovalReason(subredditName, options.title, options.message);
  }

  /**
   * Get the list of subreddit's removal reasons (ordered)
   *
   * @param subredditName
   * @example
   * ```ts
   * const reasons = await reddit.getSubredditRemovalReasons('askReddit');
   *
   * for (let reason of reasons) {
   *   console.log(reason.id, reason.message, reason.title)
   * }
   * ```
   *
   * @returns Ordered array of Removal Reasons
   */
  getSubredditRemovalReasons(subredditName: string): Promise<RemovalReason[]> {
    return Subreddit.getRemovalReasons(subredditName);
  }

  /**
   * Retrieves the current subreddit.
   *
   * @returns {Promise<Subreddit>} A Promise that resolves a Subreddit object.
   * @example
   * ```ts
   * const currentSubreddit = await reddit.getCurrentSubreddit();
   * ```
   */
  async getCurrentSubreddit(): Promise<Subreddit> {
    const currentSubreddit = await Subreddit.getFromMetadata();
    if (!currentSubreddit) {
      throw new Error("Couldn't get current subreddit");
    }
    return currentSubreddit;
  }

  /**
   * Gets a {@link Post} object by ID
   *
   * @param id
   * @returns A Promise that resolves to a Post object.
   */
  getPostById(id: string): Promise<Post> {
    return Post.getById(asTID<T3ID>(id));
  }

  /**
   * Submits a new post to a subreddit.
   *
   * @param options - Either a self post or a link post.
   * @returns A Promise that resolves to a Post object.
   * @example
   * ```ts
   * const post = await reddit.submitPost({
   *   subredditName: 'devvit',
   *   title: 'Hello World',
   *   richtext: new RichTextBuilder()
   *     .heading({ level: 1 }, (h) => {
   *       h.rawText('Hello world');
   *     })
   *     .codeBlock({}, (cb) => cb.rawText('This post was created via the Devvit API'))
   *     .build()
   * });
   * ```
   *
   * By default, `submitPost()` creates a Post on behalf of the App account, but it may be called on behalf of the User making the request by setting the option `runAs: RunAs.USER`.
   * When using `runAs: RunAs.USER` to create an experience Post, you must specify the `userGeneratedContent` option. For example:
   * @example
   * ```ts
   * import { RunAs } from '@devvit/public-api';
   * 
   * const post = await reddit.submitPost({
   *  title: 'My Devvit Post',
   *  runAs: RunAs.USER,
   *  userGeneratedContent: {
   *    text: "hello there", 
   *    imageUrls: ["https://styles.redditmedia.com/t5_5wa5ww/styles/communityIcon_wyopomb2xb0a1.png", "https://styles.redditmedia.com/t5_49fkib/styles/bannerBackgroundImage_5a4axis7cku61.png"]
      },
   *  subredditName: await reddit.getCurrentSubredditName(),
   *  textFallback: {
   *    text: 'This is a Devvit post!',
   *  },
   *  preview: (
   *    <vstack height="100%" width="100%" alignment="middle center">
   *      <text size="large">Loading...</text>
   *    </vstack>
   *  ),
   * });
   * ```
   */
  submitPost(options: SubmitPostOptions): Promise<Post> {
    return Post.submit(options);
  }

  /**
   * Crossposts a post to a subreddit.
   *
   * @param options - Options for crossposting a post
   * @param options.subredditName - The name of the subreddit to crosspost to
   * @param options.postId - The ID of the post to crosspost
   * @param options.title - The title of the crosspost
   * @returns - A Promise that resolves to a Post object.
   */
  crosspost(options: CrosspostOptions): Promise<Post> {
    return Post.crosspost(options);
  }

  /**
   * Gets a {@link User} object by ID
   *
   * @param id - The ID (starting with t2_) of the user to retrieve. e.g. t2_1qjpg
   * @returns A Promise that resolves to a User object.
   * @example
   * ```ts
   * const user = await reddit.getUserById('t2_1qjpg');
   * ```
   */
  getUserById(id: string): Promise<User | undefined> {
    return User.getById(asTID<T2ID>(id));
  }

  /**
   * Gets a {@link User} object by username
   *
   * @param username - The username of the user omitting the u/. e.g. 'devvit'
   * @returns A Promise that resolves to a User object or undefined if user is
   *          not found (user doesn't exist, account suspended, etc).
   * @example
   * ```ts
   * const user = await reddit.getUserByUsername('devvit');
   * if (user) {
   *   console.log(user)
   * }
   * ```
   */
  getUserByUsername(username: string): Promise<User | undefined> {
    return User.getByUsername(username);
  }

  /**
   * Get the current calling user's username.
   * Resolves to undefined for logged-out custom post renders.
   *
   * @returns A Promise that resolves to a string representing the username or undefined
   * @example
   * ```ts
   * const username = await reddit.getCurrentUsername();
   * ```
   */
  async getCurrentUsername(): Promise<string | undefined> {
    return (await this.getCurrentUser())?.username;
  }

  /**
   * Get the current calling user.
   * Resolves to undefined for logged-out custom post renders.
   *
   * @returns A Promise that resolves to a User object or undefined
   * @example
   * ```ts
   * const user = await reddit.getCurrentUser();
   * ```
   */
  async getCurrentUser(): Promise<User | undefined> {
    // If there's no user logged in, return undefined.
    const userId = context.userId;
    if (!userId) {
      return undefined;
    }

    // Get the user from cache; if we miss, fetch the user and cache it.
    let curUser = getContextCache<User>(CACHE_KEY_CURRENT_USER);
    if (!curUser) {
      curUser = await User.getById(asT2ID(userId));
      if (!curUser) {
        return undefined;
      }
      setContextCache(CACHE_KEY_CURRENT_USER, curUser);
    }

    return curUser;
  }

  /**
   * Get the user that the app runs as on the provided metadata.
   *
   * @returns A Promise that resolves to a User object.
   * @example
   * ```ts
   * const user = await reddit.getAppUser(metadata);
   * ```
   */
  getAppUser(): Promise<User | undefined> {
    const appUsername = context.appName;
    return User.getByUsername(appUsername);
  }

  /**
   * Get the snoovatar URL for a given username.
   *
   * @param username - The username of the snoovatar to retrieve
   * @returns A Promise that resolves to a URL of the snoovatar image if it exists.
   */
  async getSnoovatarUrl(username: string): Promise<string | undefined> {
    const currentUsername = await this.getCurrentUsername();
    if (currentUsername && username === currentUsername) {
      const snoovatarUrl = this.#metadata?.[Header.UserSnoovatarUrl]?.values[0];
      if (snoovatarUrl) {
        return snoovatarUrl;
      }
    }
    return User.getSnoovatarUrl(username);
  }

  /**
   * Get a {@link Comment} object by ID
   *
   * @param id - The ID (starting with t1_) of the comment to retrieve. e.g. t1_1qjpg
   * @returns A Promise that resolves to a Comment object.
   * @example
   * ```ts
   * const comment = await reddit.getCommentById('t1_1qjpg');
   * ```
   */
  getCommentById(id: string): Promise<Comment> {
    return Comment.getById(asTID<T1ID>(id));
  }

  /**
   * Get a list of comments from a specific post or comment.
   *
   * @param options - Options for the request
   * @param options.postId - The ID of the post e.g. 't3_1qjpg'
   * @param options.commentId - The ID of the comment e.g. 't1_1qjpg'
   * @param options.limit - The maximum number of comments to return. e.g. 1000
   * @param options.pageSize - The number of comments to return per request. e.g. 100
   * @param options.sort - The sort order of the comments. e.g. 'new'
   * @returns A Listing of Comment objects.
   * @example
   * ```ts
   * const comments = await reddit.getComments({
   *   postId: 't3_1qjpg',
   *   limit: 1000,
   *   pageSize: 100
   * }).all();
   * ```
   */
  getComments(options: GetCommentsOptions): Listing<Comment> {
    return Comment.getComments(options);
  }

  /**
   * Get a list of comments by a specific user.
   *
   * @param options - Options for the request
   * @param options.username - The username of the user omitting the u/. e.g. 'spez'
   * @param options.sort - The sort order of the comments. e.g. 'new'
   * @param options.timeframe - The timeframe of the comments. e.g. 'all'
   * @param options.limit - The maximum number of comments to return. e.g. 1000
   * @param options.pageSize - The number of comments to return per request. e.g. 100
   * @returns A Listing of Comment objects.
   */
  getCommentsByUser(options: GetCommentsByUserOptions): Listing<Comment> {
    return Comment.getCommentsByUser(options);
  }

  /**
   * Submit a new comment to a post or comment.
   *
   * @param options - You must provide either `options.text` or `options.richtext` but not both.
   * @param options.id - The ID of the post or comment to comment on. e.g. 't3_1qjpg' for post and 't1_1qgif' for comment
   * @param options.text - The text of the comment
   * @param options.richtext - The rich text of the comment
   * @param options.runAs - The user type to submit the comment as, eg 'APP' or 'USER'
   * @returns A Promise that resolves to a Comment object.
   * @example
   * ```ts
   * import { RunAs } from '@devvit/public-api';
   *
   * const comment = await reddit.submitComment({
   *  id: 't1_1qgif',
   *  text: 'Hello world!',
   *  runAs: RunAs.APP,
   * })
   * ```
   */
  submitComment(options: CommentSubmissionOptions & { id: string }): Promise<Comment> {
    return Comment.submit({
      ...options,
      id: asTID<T3ID | T1ID>(options.id),
    });
  }

  /**
   * Get a list of controversial posts from a specific subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get posts from. e.g. 'memes'
   * @param options.timeframe - The timeframe to get posts from. e.g. 'day'
   * @param options.limit - The maximum number of posts to return. e.g. 1000
   * @param options.pageSize - The number of posts to return per request. e.g. 100
   * @returns A Listing of Post objects.
   * @example
   * ```ts
   * const posts = await reddit.getControversialPosts({
   *   subredditName: 'memes',
   *   timeframe: 'day',
   *   limit: 1000,
   *   pageSize: 100
   * }).all();
   * ```
   */
  getControversialPosts(options: GetPostsOptionsWithTimeframe): Listing<Post> {
    return Post.getControversialPosts(options);
  }

  /**
   * Get a list of controversial posts from a specific subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get posts from. e.g. 'memes'
   * @param options.timeframe - The timeframe to get posts from. e.g. 'day'
   * @param options.limit - The maximum number of posts to return. e.g. 1000
   * @param options.pageSize - The number of posts to return per request. e.g. 100
   * @returns A Listing of Post objects.
   * @example
   * ```ts
   * const posts = await reddit.getControversialPosts({
   *   subredditName: 'memes',
   *   timeframe: 'day',
   *   limit: 1000,
   *   pageSize: 100
   * }).all();
   * ```
   */
  getTopPosts(options: GetPostsOptionsWithTimeframe): Listing<Post> {
    return Post.getTopPosts(options);
  }

  /**
   * Get a list of hot posts from a specific subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get posts from. e.g. 'memes'
   * @param options.timeframe - The timeframe to get posts from. e.g. 'day'
   * @param options.limit - The maximum number of posts to return. e.g. 1000
   * @param options.pageSize - The number of posts to return per request. e.g. 100
   * @returns A Listing of Post objects.
   * @example
   * ```ts
   * const posts = await reddit.getHotPosts({
   *   subredditName: 'memes',
   *   timeframe: 'day',
   *   limit: 1000,
   *   pageSize: 100
   * }).all();
   * ```
   */
  getHotPosts(options: GetHotPostsOptions): Listing<Post> {
    return Post.getHotPosts(options);
  }

  /**
   * Get a list of new posts from a specific subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get posts from. e.g. 'memes'
   * @param options.limit - The maximum number of posts to return. e.g. 1000
   * @param options.pageSize - The number of posts to return per request. e.g. 100
   * @returns A Listing of Post objects.
   * @example
   * ```ts
   * const posts = await reddit.getNewPosts({
   *   subredditName: 'memes',
   *   limit: 1000,
   *   pageSize: 100
   * }).all();
   * ```
   */
  getNewPosts(options: GetPostsOptions): Listing<Post> {
    return Post.getNewPosts(options);
  }

  /**
   * Get a list of hot posts from a specific subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get posts from. e.g. 'memes'
   * @param options.timeframe - The timeframe to get posts from. e.g. 'day'
   * @param options.limit - The maximum number of posts to return. e.g. 1000
   * @param options.pageSize - The number of posts to return per request. e.g. 100
   * @returns A Listing of Post objects.
   * @example
   * ```ts
   * const posts = await reddit.getRisingPosts({
   *   subredditName: 'memes',
   *   timeframe: 'day',
   *   limit: 1000,
   *   pageSize: 100
   * }).all();
   * ```
   */
  getRisingPosts(options: GetPostsOptions): Listing<Post> {
    return Post.getRisingPosts(options);
  }

  /**
   * Get a list of posts from a specific user.
   *
   * @param options - Options for the request
   * @param options.username - The username of the user omitting the u/. e.g. 'spez'
   * @param options.sort - The sort method to use. e.g. 'new'
   * @param options.timeframe - The timeframe to get posts from. e.g. 'day'
   * @param options.limit - The maximum number of posts to return. e.g. 1000
   * @param options.pageSize - The number of posts to return per request. e.g. 100
   * @returns A Listing of Post objects.
   */
  getPostsByUser(options: GetPostsByUserOptions): Listing<Post> {
    return Post.getPostsByUser(options);
  }

  /**
   * Get a list of posts and comments from a specific user.
   *
   * @param options - Options for the request
   * @param options.username - The username of the user omitting the u/. e.g. 'spez'
   * @param options.sort - The sort method to use. e.g. 'new'
   * @param options.timeframe - The timeframe to get posts from. e.g. 'day'
   * @param options.limit - The maximum number of posts to return. e.g. 1000
   * @param options.pageSize - The number of posts to return per request. e.g. 100
   * @returns A Listing of `Post` and `Comment` objects.
   */
  getCommentsAndPostsByUser(options: GetUserOverviewOptions): Listing<Post | Comment> {
    return User.getOverview(options);
  }

  /**
   * Get the moderation log for a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get the moderation log from. e.g. 'memes'
   * @param options.moderatorUsernames (optional) A moderator filter. Accepts an array of usernames
   * @param options.type (optional) Filter the entries by the type of the Moderator action
   * @param options.limit - (optional) The maximum number of ModActions to return. e.g. 1000
   * @param options.pageSize - (optional) The number of ModActions to return per request. e.g. 100
   * @returns A Listing of ModAction objects.
   * @example
   * ```ts
   * const modActions = await reddit.getModerationLog({
   *   subredditName: 'memes',
   *   moderatorUsernames: ['spez'],
   *   type: 'banuser',
   *   limit: 1000,
   *   pageSize: 100
   * }).all();
   * ```
   */
  getModerationLog(options: GetModerationLogOptions): Listing<ModAction> {
    return getModerationLog(options);
  }

  /**
   * Get a list of users who have been approved to post in a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get the approved users from. e.g. 'memes'
   * @param options.username - Use this to see if a user is approved to post in the subreddit.
   * @param options.limit - The maximum number of users to return. e.g. 1000
   * @param options.pageSize - The number of users to return per request. e.g. 100
   * @returns A Listing of User objects.
   */
  getApprovedUsers(options: GetSubredditUsersOptions): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'contributors',
      ...options,
    });
  }

  /**
   * Approve a user to post in a subreddit.
   *
   * @param username - The username of the user to approve. e.g. 'spez'
   * @param subredditName - The name of the subreddit to approve the user in. e.g. 'memes'
   */
  approveUser(username: string, subredditName: string): Promise<void> {
    return User.createRelationship({
      username,
      subredditName,
      type: 'contributor',
    });
  }

  /**
   * Remove a user's approval to post in a subreddit.
   *
   * @param username - The username of the user to remove approval from. e.g. 'spez'
   * @param subredditName - The name of the subreddit to remove the user's approval from. e.g. 'memes'
   */
  removeUser(username: string, subredditName: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName,
      type: 'contributor',
    });
  }

  /**
   * Get a list of users who are wiki contributors of a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get the wiki contributors from. e.g. 'memes'
   * @param options.username - Use this to see if a user is a wiki contributor for the subreddit.
   * @param options.limit - The maximum number of users to return. e.g. 1000
   * @param options.pageSize - The number of users to return per request. e.g. 100
   * @returns A Listing of User objects.
   */
  getWikiContributors(options: GetSubredditUsersOptions): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'wikicontributors',
      ...options,
    });
  }

  /**
   * Add a user as a wiki contributor for a subreddit.
   *
   * @param username - The username of the user to add as a wiki contributor. e.g. 'spez'
   * @param subredditName - The name of the subreddit to add the user as a wiki contributor. e.g. 'memes'
   */
  addWikiContributor(username: string, subredditName: string): Promise<void> {
    return User.createRelationship({
      username,
      subredditName,
      type: 'wikicontributor',
    });
  }

  /**
   * Remove a user's wiki contributor status for a subreddit.
   *
   * @param username - The username of the user to remove wiki contributor status from. e.g. 'spez'
   * @param subredditName - The name of the subreddit to remove the user's wiki contributor status from. e.g. 'memes'
   */
  removeWikiContributor(username: string, subredditName: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName,
      type: 'wikicontributor',
    });
  }

  /**
   * Get a list of users who are banned from a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get the banned users from. e.g. 'memes'
   * @param options.username - Use this to see if a user is banned from the subreddit.
   * @param options.limit - The maximum number of users to return. e.g. 1000
   * @param options.pageSize - The number of users to return per request. e.g. 100
   * @returns A Listing of User objects.
   */
  getBannedUsers(options: GetSubredditUsersOptions): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'banned',
      ...options,
    });
  }

  /**
   * Ban a user from a subreddit.
   *
   * @param options - Options for the request
   * @param options.username - The username of the user to ban. e.g. 'spez'
   * @param options.subredditName - The name of the subreddit to ban the user from. e.g. 'memes'
   * @param options.note - A mod note for the ban. (optional)
   * @param options.duration - The number of days the user should be banned for. (optional)
   * @param options.message - A message to send to the user when they are banned. (optional)
   * @param options.context - The ID of the post or comment that caused the ban. (optional)
   * @param options.reason - The reason for the ban. (optional)
   */
  banUser(options: BanUserOptions): Promise<void> {
    return User.createRelationship({
      username: options.username,
      subredditName: options.subredditName,
      type: 'banned',
      banReason: options.reason,
      banMessage: options.message,
      note: options.note,
      duration: options.duration,
      banContext: options.context,
    });
  }

  /**
   * Unban a user from a subreddit.
   *
   * @param username - The username of the user to unban. e.g. 'spez'
   * @param subredditName - The name of the subreddit to unban the user from. e.g. 'memes'
   */
  unbanUser(username: string, subredditName: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName,
      type: 'banned',
    });
  }

  /**
   * Get a list of users who are banned from contributing to the wiki on a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get the banned wiki contributors from. e.g. 'memes'
   * @param options.username - Use this to see if a user is banned from contributing to the wiki on a subreddit.
   * @param options.limit - The maximum number of users to return. e.g. 1000
   * @param options.pageSize - The number of users to return per request. e.g. 100
   * @returns A Listing of User objects.
   */
  getBannedWikiContributors(options: GetSubredditUsersOptions): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'wikibanned',
      ...options,
    });
  }

  /**
   * Ban a user from contributing to the wiki on a subreddit.
   *
   * @param options - Options for the request
   * @param options.username - The username of the user to ban. e.g. 'spez'
   * @param options.subredditName - The name of the subreddit to ban the user from contributing to the wiki on. e.g. 'memes'
   * @param options.reason - The reason for the ban. (optional)
   * @param options.duration - The number of days the user should be banned for. (optional)
   * @param options.note - A mod note for the ban. (optional)
   */
  banWikiContributor(options: BanWikiContributorOptions): Promise<void> {
    return User.createRelationship({
      ...options,
      type: 'wikibanned',
    });
  }

  /**
   *
   * @param username - The username of the user to unban. e.g. 'spez'
   * @param subredditName - The name of the subreddit to unban the user from contributing to the wiki on. e.g. 'memes'
   */
  unbanWikiContributor(username: string, subredditName: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName,
      type: 'wikibanned',
    });
  }

  /**
   * Get a list of users who are moderators for a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get the moderators from. e.g. 'memes'
   * @param options.username - Use this to see if a user is a moderator of the subreddit.
   * @param options.limit - The maximum number of users to return. e.g. 1000
   * @param options.pageSize - The number of users to return per request. e.g. 100
   * @returns A Listing of User objects.
   */
  getModerators(options: GetSubredditUsersOptions): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'moderators',
      ...options,
    });
  }

  /**
   * Invite a user to become a moderator of a subreddit.
   *
   * @param options - Options for the request
   * @param options.username - The username of the user to invite. e.g. 'spez'
   * @param options.subredditName - The name of the subreddit to invite the user to moderate. e.g. 'memes'
   * @param options.permissions - The permissions to give the user. (optional) Defaults to 'all'.
   */
  inviteModerator(options: InviteModeratorOptions): Promise<void> {
    return User.createRelationship({
      type: 'moderator_invite',
      subredditName: options.subredditName,
      username: options.username,
      permissions: options.permissions ?? [],
    });
  }

  /**
   * Revoke a moderator invite for a user to a subreddit.
   *
   * @param username - The username of the user to revoke the invite for. e.g. 'spez'
   * @param subredditName - The name of the subreddit to revoke the invite for. e.g. 'memes'
   */
  revokeModeratorInvite(username: string, subredditName: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName,
      type: 'moderator_invite',
    });
  }

  /**
   * Remove a user as a moderator of a subreddit.
   *
   * @param username - The username of the user to remove as a moderator. e.g. 'spez'
   * @param subredditName - The name of the subreddit to remove the user as a moderator from. e.g. 'memes'
   */
  removeModerator(username: string, subredditName: string): Promise<void> {
    return User.removeRelationship({
      type: 'moderator',
      subredditName,
      username,
    });
  }

  /**
   * Update the permissions of a moderator of a subreddit.
   *
   * @param username - The username of the user to update the permissions for. e.g. 'spez'
   * @param subredditName - The name of the subreddit. e.g. 'memes'
   * @param permissions - The permissions to give the user. e.g ['posts', 'wiki']
   */
  setModeratorPermissions(
    username: string,
    subredditName: string,
    permissions: ModeratorPermission[]
  ): Promise<void> {
    return User.setModeratorPermissions(username, subredditName, permissions);
  }

  /**
   * Get a list of users who are muted in a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get the muted users from. e.g. 'memes'
   * @param options.username - Use this to see if a user is muted in the subreddit.
   * @param options.limit - The maximum number of users to return. e.g. 1000
   * @param options.pageSize - The number of users to return per request. e.g. 100
   * @returns A listing of User objects.
   */
  getMutedUsers(options: GetSubredditUsersOptions): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'muted',
      ...options,
    });
  }

  /**
   * Mute a user in a subreddit. Muting a user prevents them from sending modmail.
   *
   * @param options - Options for the request
   * @param options.username - The username of the user to mute. e.g. 'spez'
   * @param options.subredditName - The name of the subreddit to mute the user in. e.g. 'memes'
   * @param options.note - A mod note on why the user was muted. (optional)
   */
  muteUser(options: MuteUserOptions): Promise<void> {
    return User.createRelationship({
      ...options,
      type: 'muted',
    });
  }

  /**
   * Unmute a user in a subreddit. Unmuting a user allows them to send modmail.
   *
   * @param username - The username of the user to unmute. e.g. 'spez'
   * @param subredditName - The name of the subreddit to unmute the user in. e.g. 'memes'
   */
  unmuteUser(username: string, subredditName: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName,
      type: 'muted',
    });
  }

  /**
   * Get a list of mod notes related to a user in a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to get the mod notes from. e.g. 'memes'
   * @param options.username - The username of the user to get the mod notes for. e.g. 'spez'
   * @param options.filter - Filter the mod notes by type. e.g. 'NOTE', 'BAN', 'APPROVAL'
   * @param options.limit - The maximum number of mod notes to return. e.g. 1000
   * @param options.pageSize - The number of mod notes to return per request. e.g. 100
   * @returns A listing of ModNote objects.
   */
  getModNotes(options: GetModNotesOptions): Listing<ModNote> {
    return ModNote.get(options);
  }

  /**
   * Delete a mod note.
   *
   * @param options - Options for the request
   * @param options.subreddit - The name of the subreddit to delete the mod note from. e.g. 'memes'
   * @param options.noteId - The ID of the mod note to delete (should have a ModNote_ prefix).
   * @returns True if it was deleted successfully; false otherwise.
   */
  deleteModNote(options: DeleteNotesOptions): Promise<boolean> {
    return ModNote.delete(options);
  }

  /**
   * Add a mod note.
   *
   * @param options - Options for the request
   * @param options.subreddit - The name of the subreddit to add the mod note to. e.g. 'memes'
   * @param options.user - The username of the user to add the mod note to. e.g. 'spez'
   * @param options.redditId - (optional) The ID of the comment or post to add the mod note to. e.g. 't3_1234'
   * @param options.label - (optional) The label of the mod note. e.g. 'SPAM_WARNING'
   * @param options.note - The text of the mod note.
   * @returns A Promise that resolves if the mod note was successfully added.
   */
  addModNote(options: CreateModNoteOptions): Promise<ModNote> {
    const req = {
      ...options,
      ...(options.redditId ? { redditId: asTID<T1ID | T3ID>(options.redditId) } : {}),
    };
    return ModNote.add(req);
  }

  /**
   * Add a mod note for why a post or comment was removed
   *
   * @param options.itemIds list of thing ids
   * @param options.reasonId id of a Removal Reason - you can leave this as an empty string if you don't have one
   * @param options.modNote the reason for removal (maximum 100 characters) (optional)
   */
  addRemovalNote(options: AddRemovalNoteOptions): Promise<void> {
    return ModNote.addRemovalNote(options);
  }

  /**
   * Sends a private message to a user.
   *
   * @param options - The options for sending the message.
   * @returns A Promise that resolves if the private message was successfully sent.
   */
  async sendPrivateMessage(options: SendPrivateMessageOptions): Promise<void> {
    return PrivateMessage.send(options);
  }

  /**
   * Sends a private message to a user on behalf of a subreddit.
   *
   * @param options - The options for sending the message as a subreddit.
   * @returns A Promise that resolves if the private message was successfully sent.
   */
  async sendPrivateMessageAsSubreddit(
    options: SendPrivateMessageAsSubredditOptions
  ): Promise<void> {
    return PrivateMessage.sendAsSubreddit(options);
  }

  /**
   * Approve a post or comment.
   *
   * @param id - The id of the post (t3_) or comment (t1_) to approve.
   * @example
   * ```ts
   * await reddit.approve('t3_123456');
   * await reddit.approve('t1_123456');
   * ```
   */
  async approve(id: string): Promise<void> {
    if (isT1ID(id)) {
      return Comment.approve(id);
    } else if (isT3ID(id)) {
      return Post.approve(id);
    }

    throw new Error('id must start with either t1_ or t3_');
  }

  /**
   * Remove a post or comment.
   *
   * @param id - The id of the post (t3_) or comment (t1_) to remove.
   * @param isSpam - Is the post or comment being removed because it's spam?
   * @example
   * ```ts
   * await reddit.remove('t3_123456', false);
   * await reddit.remove('t1_123456', true);
   * ```
   */
  async remove(id: string, isSpam: boolean): Promise<void> {
    if (isT1ID(id)) {
      return Comment.remove(id, isSpam);
    } else if (isT3ID(id)) {
      return Post.remove(id, isSpam);
    }

    throw new Error('id must start with either t1_ or t3_');
  }

  /**
   * Get the list of post flair templates for a subreddit.
   *
   * @param subredditName - The name of the subreddit to get the post flair templates for.
   * @returns A Promise that resolves with an array of FlairTemplate objects.
   */
  async getPostFlairTemplates(subredditName: string): Promise<FlairTemplate[]> {
    return FlairTemplate.getPostFlairTemplates(subredditName);
  }

  /**
   * Get the list of user flair templates for a subreddit.
   *
   * @param subredditName - The name of the subreddit to get the user flair templates for.
   * @returns A Promise that resolves with an array of FlairTemplate objects.
   */
  async getUserFlairTemplates(subredditName: string): Promise<FlairTemplate[]> {
    return FlairTemplate.getUserFlairTemplates(subredditName);
  }

  /**
   * Create a post flair template for a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to create the flair template for.
   * @param options.allowableContent - The content that is allowed to be used with this flair template. e.g. 'all' or 'text' or 'emoji'
   * @param options.backgroundColor - The background color of the flair template. e.g. '#ff0000' or 'transparent'
   * @param options.maxEmojis - The maximum number of emojis that can be used with this flair template.
   * @param options.modOnly - Whether or not this flair template is only available to mods.
   * @param options.text - The text of the flair template.
   * @param options.textColor - The text color of the flair template. Either 'dark' or 'light'.
   * @param options.allowUserEdits - Whether or not users can edit the flair template when selecting a flair.
   * @returns The created FlairTemplate object.
   */
  async createPostFlairTemplate(options: CreateFlairTemplateOptions): Promise<FlairTemplate> {
    return FlairTemplate.createPostFlairTemplate(options);
  }

  /**
   * Create a user flair template for a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to create the flair template for.
   * @param options.allowableContent - The content that is allowed to be used with this flair template. e.g. 'all' or 'text' or 'emoji'
   * @param options.backgroundColor - The background color of the flair template. e.g. '#ff0000' or 'transparent'
   * @param options.maxEmojis - The maximum number of emojis that can be used with this flair template.
   * @param options.modOnly - Whether or not this flair template is only available to mods.
   * @param options.text - The text of the flair template.
   * @param options.textColor - The text color of the flair template. Either 'dark' or 'light'.
   * @param options.allowUserEdits - Whether or not users can edit the flair template when selecting a flair.
   * @returns The created FlairTemplate object.
   */
  async createUserFlairTemplate(options: CreateFlairTemplateOptions): Promise<FlairTemplate> {
    return FlairTemplate.createUserFlairTemplate(options);
  }

  /**
   * Edit a flair template for a subreddit. This can be either a post or user flair template.
   * Note: If you leave any of the options fields as undefined, they will reset to their default values.
   *
   * @param options - Options for the request
   * @param options.id - The ID of the flair template to edit.
   * @param options.subredditName - The name of the subreddit to create the flair template for.
   * @param options.allowableContent - The content that is allowed to be used with this flair template. e.g. 'all' or 'text' or 'emoji'
   * @param options.backgroundColor - The background color of the flair template. e.g. '#ff0000' or 'transparent'
   * @param options.maxEmojis - The maximum number of emojis that can be used with this flair template.
   * @param options.modOnly - Is this flair template only available to mods?
   * @param options.text - The text of the flair template.
   * @param options.textColor - The text color of the flair template. Either 'dark' or 'light'.
   * @param options.allowUserEdits - Can users can edit the flair template when selecting a flair?
   * @returns The edited FlairTemplate object.
   */
  async editFlairTemplate(options: EditFlairTemplateOptions): Promise<FlairTemplate> {
    return FlairTemplate.editFlairTemplate(options);
  }

  /**
   * Delete a flair template from a subreddit.
   *
   * @param subredditName - The name of the subreddit to delete the flair template from.
   * @param flairTemplateId - The ID of the flair template to delete.
   */
  async deleteFlairTemplate(subredditName: string, flairTemplateId: string): Promise<void> {
    return FlairTemplate.deleteFlairTemplate(subredditName, flairTemplateId);
  }

  /**
   * Set the flair for a user in a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to set the flair for.
   * @param options.username - The username of the user to set the flair for.
   * @param options.flairTemplateId - The ID of the flair template to use.
   * @param options.text - The text of the flair.
   * @param options.cssClass - The CSS class of the flair.
   * @param options.backgroundColor - The background color of the flair.
   * @param options.textColor - The text color of the flair.
   */
  async setUserFlair(options: SetUserFlairOptions): Promise<void> {
    return Flair.setUserFlair(options);
  }

  /**
   * Set the flair of multiple users in the same subreddit with a single API call.
   * Can process up to 100 entries at once.
   *
   * @param subredditName - The name of the subreddit to edit flairs in.
   * @param {SetUserFlairBatchConfig[]} flairs - Array of user flair configuration objects. If both text and cssClass are empty for a given user the flair will be cleared.
   * @param flairs[].username - The username of the user to edit the flair for.
   * @param flairs[].text - The text of the flair.
   * @param flairs[].cssClass - The CSS class of the flair.
   * @returns {FlairCsvResult[]} - Array of statuses for each entry provided.
   */
  async setUserFlairBatch(
    subredditName: string,
    flairs: SetUserFlairBatchConfig[]
  ): Promise<FlairCsvResult[]> {
    return Flair.setUserFlairBatch(subredditName, flairs);
  }

  /**
   * Remove the flair for a user in a subreddit.
   *
   * @param subredditName - The name of the subreddit to remove the flair from.
   * @param username - The username of the user to remove the flair from.
   */
  async removeUserFlair(subredditName: string, username: string): Promise<void> {
    return Flair.removeUserFlair(subredditName, username);
  }

  /**
   * Set the flair for a post in a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit to set the flair for.
   * @param options.postId - The ID of the post to set the flair for.
   * @param options.flairTemplateId - The ID of the flair template to use.
   * @param options.text - The text of the flair.
   * @param options.cssClass - The CSS class of the flair.
   * @param options.backgroundColor - The background color of the flair.
   * @param options.textColor - The text color of the flair.
   */
  async setPostFlair(options: SetPostFlairOptions): Promise<void> {
    return Flair.setPostFlair(options);
  }

  /**
   * Remove the flair for a post in a subreddit.
   *
   * @param subredditName - The name of the subreddit to remove the flair from.
   * @param postId - The ID of the post to remove the flair from.
   */
  async removePostFlair(subredditName: string, postId: string): Promise<void> {
    return Flair.removePostFlair(subredditName, asT3ID(postId));
  }

  /**
   * Get the widgets for a subreddit.
   *
   * @param subredditName - The name of the subreddit to get the widgets for.
   * @returns - An array of Widget objects.
   */
  async getWidgets(subredditName: string): Promise<Widget[]> {
    return Widget.getWidgets(subredditName);
  }

  /**
   * Delete a widget from a subreddit.
   *
   * @param subredditName - The name of the subreddit to delete the widget from.
   * @param widgetId - The ID of the widget to delete.
   */
  async deleteWidget(subredditName: string, widgetId: string): Promise<void> {
    return Widget.delete(subredditName, widgetId);
  }

  /**
   * Add a widget to a subreddit.
   *
   * @param widgetData - The data for the widget to add.
   * @returns - The added Widget object.
   */
  async addWidget(widgetData: AddWidgetData): Promise<Widget> {
    return Widget.add(widgetData);
  }

  /**
   * Reorder the widgets for a subreddit.
   *
   * @param subredditName - The name of the subreddit to reorder the widgets for.
   * @param orderByIds - An array of widget IDs in the order that they should be displayed.
   */
  async reorderWidgets(subredditName: string, orderByIds: string[]): Promise<void> {
    return Widget.reorder(subredditName, orderByIds);
  }

  /**
   * Get a wiki page from a subreddit.
   *
   * @param subredditName - The name of the subreddit to get the wiki page from.
   * @param page - The name of the wiki page to get.
   * @returns The requested WikiPage object.
   */
  async getWikiPage(subredditName: string, page: string): Promise<WikiPage> {
    return WikiPage.getPage(subredditName, page);
  }

  /**
   * Get the wiki pages for a subreddit.
   *
   * @param subredditName - The name of the subreddit to get the wiki pages from.
   * @returns A list of the wiki page names for the subreddit.
   */
  async getWikiPages(subredditName: string): Promise<string[]> {
    return WikiPage.getPages(subredditName);
  }

  /**
   * Create a new wiki page for a subreddit.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit the wiki is in.
   * @param options.page - The name of the wiki page to create.
   * @param options.content - The Markdown content of the wiki page.
   * @param options.reason - The reason for creating the wiki page.
   * @returns - The created WikiPage object.
   */
  async createWikiPage(options: CreateWikiPageOptions): Promise<WikiPage> {
    return WikiPage.createPage(options);
  }

  /**
   * Update a wiki page.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit the wiki is in.
   * @param options.page - The name of the wiki page to update.
   * @param options.content - The Markdown content of the wiki page.
   * @param options.reason - The reason for updating the wiki page.
   * @returns The updated WikiPage object.
   */
  async updateWikiPage(options: UpdateWikiPageOptions): Promise<WikiPage> {
    return WikiPage.updatePage(options);
  }

  /**
   * Get the revisions for a wiki page.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit the wiki is in.
   * @param options.page - The name of the wiki page to get the revisions for.
   * @param options.limit - The maximum number of revisions to return.
   * @param options.after - The ID of the revision to start after.
   * @returns A Listing of WikiPageRevision objects.
   */
  getWikiPageRevisions(options: GetPageRevisionsOptions): Listing<WikiPageRevision> {
    return WikiPage.getPageRevisions(options);
  }

  /**
   * Revert a wiki page to a previous revision.
   *
   * @param subredditName - The name of the subreddit the wiki is in.
   * @param page - The name of the wiki page to revert.
   * @param revisionId - The ID of the revision to revert to.
   */
  async revertWikiPage(subredditName: string, page: string, revisionId: string): Promise<void> {
    return WikiPage.revertPage(subredditName, page, revisionId);
  }

  /**
   * Get the settings for a wiki page.
   *
   * @param subredditName - The name of the subreddit the wiki is in.
   * @param page - The name of the wiki page to get the settings for.
   * @returns A WikiPageSettings object.
   */
  async getWikiPageSettings(subredditName: string, page: string): Promise<WikiPageSettings> {
    return WikiPage.getPageSettings(subredditName, page);
  }

  /**
   * Update the settings for a wiki page.
   *
   * @param options - Options for the request
   * @param options.subredditName - The name of the subreddit the wiki is in.
   * @param options.page - The name of the wiki page to update the settings for.
   * @param options.listed - Whether the wiki page should be listed in the wiki index.
   * @param options.permLevel - The permission level required to edit the wiki page.
   * @returns A WikiPageSettings object.
   */
  async updateWikiPageSettings(options: UpdatePageSettingsOptions): Promise<WikiPageSettings> {
    return WikiPage.updatePageSettings(options);
  }

  /**
   * Add an editor to a wiki page.
   *
   * @param subredditName - The name of the subreddit the wiki is in.
   * @param page - The name of the wiki page to add the editor to.
   * @param username - The username of the user to add as an editor.
   */
  async addEditorToWikiPage(subredditName: string, page: string, username: string): Promise<void> {
    return WikiPage.addEditor(subredditName, page, username);
  }

  /**
   * Remove an editor from a wiki page.
   *
   * @param subredditName - The name of the subreddit the wiki is in.
   * @param page - The name of the wiki page to remove the editor from.
   * @param username - The username of the user to remove as an editor.
   */
  async removeEditorFromWikiPage(
    subredditName: string,
    page: string,
    username: string
  ): Promise<void> {
    return WikiPage.removeEditor(subredditName, page, username);
  }

  /**
   * Get private messages sent to the currently authenticated user.
   *
   * @param options - Options for the request
   * @param options.type - The type of messages to get.
   */
  getMessages(options: GetPrivateMessagesOptions): Promise<Listing<PrivateMessage>> {
    return PrivateMessage.getMessages(options);
  }

  /**
   * Mark all private messages as read.
   */
  markAllMessagesAsRead(): Promise<void> {
    return PrivateMessage.markAllAsRead();
  }

  /**
   * Report a Post or Comment
   *
   * The report is sent to the moderators of the subreddit for review.
   *
   * @param thing Post or Comment
   * @param options Options
   * @param options.reason Why the thing is reported
   *
   * @example
   * ```ts
   * await reddit.report(post, {
   *  reason: 'This is spam!',
   * })
   * ```
   */
  report(thing: Post | Comment, options: { reason: string }): Promise<JsonStatus> {
    const client = getRedditApiPlugins().LinksAndComments;

    return client.Report(
      {
        reason: options.reason,
        thingId: thing.id,
        srName: thing.subredditName,
        usernames: thing.authorName,
      },
      this.#metadata
    );
  }

  /**
   * Return a listing of things requiring moderator review, such as reported things and items.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getModQueue();
   * console.log("Posts and Comments: ",  await listing.all())
   * listing = await subreddit.getModQueue({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getModQueue(options: ModLogOptions<'comment'>): Listing<Comment>;
  getModQueue(options: ModLogOptions<'post'>): Listing<Post>;
  getModQueue(options: ModLogOptions<'all'>): Listing<Post | Comment>;
  getModQueue(options: ModLogOptions<AboutSubredditTypes>): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Modqueue,
    });
  }

  /**
   * Return a listing of things that have been reported.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getReports();
   * console.log("Posts and Comments: ", await listing.all())
   * listing = await subreddit.getReports({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getReports(options: ModLogOptions<'comment'>): Listing<Comment>;
  getReports(options: ModLogOptions<'post'>): Listing<Post>;
  getReports(options: ModLogOptions<'all'>): Listing<Post | Comment>;
  getReports(options: ModLogOptions<AboutSubredditTypes>): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Reports,
    });
  }

  /**
   * Return a listing of things that have been marked as spam or otherwise removed.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getSpam();
   * console.log("Posts and Comments: ", await listing.all())
   * listing = await subreddit.getSpam({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getSpam(options: ModLogOptions<'comment'>): Listing<Comment>;
  getSpam(options: ModLogOptions<'post'>): Listing<Post>;
  getSpam(options: ModLogOptions<'all'>): Listing<Post | Comment>;
  getSpam(options: ModLogOptions<AboutSubredditTypes>): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Spam,
    });
  }

  /**
   * Return a listing of things that have yet to be approved/removed by a mod.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getUnmoderated();
   * console.log("Posts and Comments: ", await listing.all())
   * listing = await subreddit.getUnmoderated({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getUnmoderated(options: ModLogOptions<'comment'>): Listing<Comment>;
  getUnmoderated(options: ModLogOptions<'post'>): Listing<Post>;
  getUnmoderated(options: ModLogOptions<'all'>): Listing<Post | Comment>;
  getUnmoderated(options: ModLogOptions<AboutSubredditTypes>): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Unmoderated,
    });
  }

  /**
   * Return a listing of things that have been edited recently.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getEdited();
   * console.log("Posts and Comments: ", await listing.all())
   * listing = await subreddit.getEdited({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getEdited(options: ModLogOptions<'comment'>): Listing<Comment>;
  getEdited(options: ModLogOptions<'post'>): Listing<Post>;
  getEdited(options: ModLogOptions<'all'>): Listing<Post | Comment>;
  getEdited(options: ModLogOptions<AboutSubredditTypes>): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Edited,
    });
  }

  /**
   * Gets a {@link Vault} for the specified address.
   *
   * @param {string} address - The address (starting with 0x) of the Vault.
   * @example
   * ```ts
   * const vault = await reddit.getVaultByAddress('0x205ee28744456bDBf180A0Fa7De51e0F116d54Ed');
   * ```
   */
  getVaultByAddress(address: string): Promise<Vault> {
    return getVaultByAddress(address);
  }

  /**
   * Gets a {@link Vault} for the specified user.
   *
   * @param {string} userId - The ID (starting with t2_) of the Vault owner.
   * @example
   * ```ts
   * const vault = await reddit.getVaultByUserId('t2_1w72');
   * ```
   */
  getVaultByUserId(userId: string): Promise<Vault> {
    return getVaultByUserId(asTID<T2ID>(userId));
  }

  /**
   * Returns a leaderboard for a given subreddit ID.
   *
   * @param subredditId ID of the subreddit for which the leaderboard is being queried.
   *
   * @returns {SubredditLeaderboard} Leaderboard for the given subreddit.
   */
  getSubredditLeaderboard(subredditId: string): Promise<SubredditLeaderboard> {
    return getSubredditLeaderboard(subredditId);
  }

  /**
   * Returns the styles for a given subreddit ID.
   *
   * @param subredditId ID of the subreddit from which to retrieve the styles.
   *
   * @returns {SubredditStyles} Styles for the given subreddit.
   */
  getSubredditStyles(subredditId: string): Promise<SubredditStyles> {
    return getSubredditStyles(subredditId);
  }

  /**
   * Subscribes to the subreddit in which the app is installed. No-op if the user is already subscribed.
   * This method will execute as the app account by default.
   * To subscribe on behalf of a user, please contact Reddit.
   */
  async subscribeToCurrentSubreddit(): Promise<void> {
    const currentSubreddit = await this.getCurrentSubreddit();
    const client = getRedditApiPlugins().Subreddits;

    await client.Subscribe(
      {
        action: 'sub',
        actionSource: '',
        srName: currentSubreddit.name,
        sr: '',
        skipInitialDefaults: true,
      },
      this.#metadata
    );
  }

  /**
   * Unsubscribes from the subreddit in which the app is installed. No-op if the user isn't subscribed.
   * This method will execute as the app account by default.
   * To unsubscribe on behalf of a user, please contact Reddit.
   */
  async unsubscribeFromCurrentSubreddit(): Promise<void> {
    const currentSubreddit = await this.getCurrentSubreddit();
    const client = getRedditApiPlugins().Subreddits;

    await client.Subscribe(
      {
        action: 'unsub',
        actionSource: '',
        srName: currentSubreddit.name,
        sr: '',
        skipInitialDefaults: false,
      },
      this.#metadata
    );
  }

  get #metadata(): Metadata {
    return context.metadata;
  }
}

export const reddit: RedditClient = new RedditClient();
