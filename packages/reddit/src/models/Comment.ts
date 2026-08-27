import type { JsonWrappedComment_WrappedComment } from '@devvit/protos/json/devvit/plugin/redditapi/linksandcomments/linksandcomments_msg.js';
import type { Comment as CommentProto } from '@devvit/protos/json/devvit/reddit/comment.js';
import { Scope } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type {
  RedditObject,
  WrappedRedditObject,
} from '@devvit/protos/types/devvit/plugin/redditapi/common/common_msg.js';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import { asTid, isT1, T1, T2, T3, T5 } from '@devvit/shared-types/tid.js';

import { assertUserScope, RunAs } from '../common.js';
import { type FilterOptions, filterThing } from '../helpers/filterThing.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { richtextToString } from '../helpers/richtextToString.js';
import { getRedditApiPlugins, getUserActionsPlugin } from '../plugin.js';
import type { CommonFlair } from './Flair.js';
import { convertProtosFlairToCommonFlair } from './Flair.js';
import type { ListingFetchOptions, ListingFetchResponse, MoreObject } from './Listing.js';
import { Listing } from './Listing.js';
import { type AddRemovalNoteOptions, ModNote } from './ModNote.js';
import type { ModeratorReport } from './Post.js';
import { User } from './User.js';

export type CommentSort =
  | 'confidence'
  | 'top'
  | 'new'
  | 'controversial'
  | 'old'
  | 'random'
  | 'qa'
  | 'live';

export type GetCommentsOptions = {
  postId: T3;
  commentId?: T1 | undefined;
  depth?: number;
  pageSize?: number;
  limit?: number;
  sort?: CommentSort;
};

type GetCommentsListingOptions = {
  postId: T3;
  commentId?: T1 | undefined;
  depth?: number;
  pageSize?: number;
  limit?: number;
  sort?: CommentSort;
};

/** Options for submitting a comment body. */
export type CommentSubmissionOptions =
  | {
      /** The comment body in Markdown. */
      text: string;
      /**
       * The account used to create the comment. Defaults to the app account.
       * This option is ignored by {@link Comment.edit}.
       */
      runAs?: 'USER' | 'APP';
    }
  | {
      /** The comment body as rich text. */
      richtext: object | RichTextBuilder;
      /**
       * The account used to create the comment. Defaults to the app account.
       * This option is ignored by {@link Comment.edit}.
       */
      runAs?: 'USER' | 'APP';
    };

/** Options for replacing a comment body. */
export type EditCommentOptions = CommentSubmissionOptions;
/** Options for replying to a comment. */
export type ReplyToCommentOptions = CommentSubmissionOptions;

export type GetCommentsByUserOptions = {
  username: string;
  sort?: 'hot' | 'new' | 'top' | 'controversial';
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  pageSize?: number;
  limit?: number;
  after?: string;
  before?: string;
};

export class Comment {
  #id: T1;
  #authorId: T2 | undefined;
  #authorName: string;
  #body: string;
  #createdAt: Date;
  #parentId: T1 | T3;
  #postId: T3;
  #subredditId: T5;
  #subredditName: string;
  #replies: Listing<Comment>;
  #approved: boolean;
  #approvedAtUtc: number;
  #bannedAtUtc: number;
  #edited: boolean;
  #locked: boolean;
  #removed: boolean;
  #stickied: boolean;
  #spam: boolean;
  #distinguishedBy: string | undefined;
  #numReports: number;
  #collapsedBecauseCrowdControl: boolean;
  #score: number;
  #permalink: string;
  #modReports: ModeratorReport[];
  #modReportReasons: string[];
  #userReportReasons: string[];
  #url: string;
  #ignoringReports: boolean;
  #authorFlair: CommonFlair | undefined;

  /**
   * @internal
   */
  constructor(data: RedditObject | CommentProto) {
    makeGettersEnumerable(this);

    assertNonNull(data.id, 'Comment id is null or undefined');
    assertNonNull(data.body, 'Comment body is null or undefined');
    assertNonNull(data.createdUtc, 'Comment is missing created date');
    assertNonNull(data.author, 'Comment author is null or undefined');
    assertNonNull(data.parentId, 'Comment parentId is null or undefined');
    assertNonNull(data.linkId, 'Comment linkId is null or undefined');
    assertNonNull(data.permalink, 'Comment permalink is null or undefined');
    assertNonNull(data.subreddit, 'Comment is missing subreddit name');
    assertNonNull(data.subredditId, 'Comment is missing subreddit id');

    this.#id = `t1_${data.id}`;
    this.#authorId = data.authorFullname ? T2(data.authorFullname) : undefined;
    this.#authorName = data.author;
    this.#body = data.body;
    this.#subredditId = T5(data.subredditId);
    this.#subredditName = data.subreddit;
    this.#parentId = asTid<T1 | T3>(data.parentId);
    this.#postId = T3(data.linkId);
    this.#edited = data.edited ?? false;
    this.#locked = data.locked ?? false;
    this.#removed = data.removed ?? false;
    this.#stickied = data.stickied ?? false;
    this.#approved = data.approved ?? false;
    this.#approvedAtUtc = data.approvedAtUtc ?? 0;
    this.#bannedAtUtc = data.bannedAtUtc ?? 0;
    this.#spam = data.spam ?? false;
    this.#distinguishedBy = data.distinguished;
    this.#numReports = data.numReports ?? 0;
    this.#collapsedBecauseCrowdControl = data.collapsedBecauseCrowdControl ?? false;
    this.#score = data.score ?? 0;
    this.#permalink = data.permalink;
    // R2 API does not include a URL for a comment, just a permalink
    this.#url = new URL(data.permalink ?? '', 'https://www.reddit.com/').toString();
    this.#ignoringReports = data.ignoreReports ?? false;

    this.#authorFlair = convertProtosFlairToCommonFlair({
      flairBackgroundColor: data.authorFlairBackgroundColor,
      flairCssClass: data.authorFlairCssClass,
      flairText: data.authorFlairText,
      flairType: data.authorFlairType,
      flairTemplateId: data.authorFlairTemplateId,
      flairRichtext: data.authorFlairRichtext,
      flairTextColor: data.authorFlairTextColor,
    });

    this.#modReports = ((data.modReports as unknown as [string, string][]) ?? []).map(
      ([reason, author]) => ({ reason, author })
    );
    this.#modReportReasons = ((data.modReports as unknown as [string, string]) ?? []).map(
      ([reason]) => reason
    );
    this.#userReportReasons = ((data.userReports as unknown as [string, string]) ?? []).map(
      ([reason]) => reason
    );

    const createdAt = new Date(0);
    createdAt.setUTCSeconds(data.createdUtc);
    this.#createdAt = createdAt;

    this.#replies = Comment.#getCommentsListing({
      postId: this.#postId,
      commentId: this.#id,
    });
  }

  get id(): T1 {
    return this.#id;
  }

  /** The creator's account identifier or `undefined` when unavailable. */
  get authorId(): T2 | undefined {
    return this.#authorId;
  }

  /**
   * The creator's username without the leading `u/`. May be `"[deleted]"` when
   * the author is unavailable.
   *
   * @example "Example_User"
   */
  get authorName(): string {
    return this.#authorName;
  }

  /** The subreddit identifier where the comment was created. */
  get subredditId(): T5 {
    return this.#subredditId;
  }

  /**
   * The name of the subreddit that contains the comment, without the leading
   * `r/`.
   *
   * @example "AskReddit"
   */
  get subredditName(): string {
    return this.#subredditName;
  }

  /** The comment body in Markdown. */
  get body(): string {
    return this.#body;
  }

  /** The date when the comment was created. */
  get createdAt(): Date {
    return this.#createdAt;
  }

  /**
   * The identifier of the comment's parent.
   *
   * A top-level comment returns the containing post's `T3`. A reply returns its
   * parent comment's `T1`.
   */
  get parentId(): T1 | T3 {
    return this.#parentId;
  }

  /** The identifier of the post containing the comment. */
  get postId(): T3 {
    return this.#postId;
  }

  /** The comment's direct replies. */
  get replies(): Listing<Comment> {
    return this.#replies;
  }

  /**
   * The comment's distinction category.
   *
   * For example, a comment distinguished by a moderator or administrator
   * returns `"moderator"` or `"admin"`. `undefined` means no distinction is
   * available.
   */
  get distinguishedBy(): string | undefined {
    return this.#distinguishedBy;
  }

  /** Whether the comment is locked and new replies are disabled. */
  get locked(): boolean {
    return this.#locked;
  }

  /** Whether the comment is pinned to the top of its comment thread. */
  get stickied(): boolean {
    return this.#stickied;
  }

  /** Whether the comment has been removed by a moderator. */
  get removed(): boolean {
    return this.#removed;
  }

  /** Whether the comment has been approved by a moderator. */
  get approved(): boolean {
    return this.#approved;
  }

  /**
   * The moderation approval time as Unix seconds, or `0` when unavailable.
   *
   * Use {@link approved} to check the current approval state. Convert a
   * nonzero value to a `Date` with `new Date(comment.approvedAtUtc * 1000)`.
   */
  get approvedAtUtc(): number {
    return this.#approvedAtUtc;
  }

  /**
   * The ban time as Unix seconds, or `0` when unavailable.
   *
   * Convert a nonzero value to a `Date` with
   * `new Date(comment.bannedAtUtc * 1000)`.
   */
  get bannedAtUtc(): number {
    return this.#bannedAtUtc;
  }

  /** Whether the comment has been marked as spam by a moderator. */
  get spam(): boolean {
    return this.#spam;
  }

  /** Whether the comment body has been edited since it was created. */
  get edited(): boolean {
    return this.#edited;
  }

  /** The number of reports, or `0` when none are available. */
  get numReports(): number {
    return this.#numReports;
  }

  /** Whether Crowd Control caused the comment to be collapsed. */
  get collapsedBecauseCrowdControl(): boolean {
    return this.#collapsedBecauseCrowdControl;
  }

  /** The comment's upvotes minus downvotes, or `0` when unavailable. */
  get score(): number {
    return this.#score;
  }

  /**
   * The comment's path relative to `https://www.reddit.com`.
   *
   * @example "/r/wallstreetbets/comments/abc123/example_post/def456/"
   */
  get permalink(): string {
    return this.#permalink;
  }

  /** User report reasons, or an empty array when none are available. */
  get userReportReasons(): string[] {
    return this.#userReportReasons;
  }

  /** Moderator reports and authors, or an empty array when unavailable. */
  get modReports(): ModeratorReport[] {
    return this.#modReports;
  }

  /** @deprecated Use {@link modReports} to retain each report's author. */
  get modReportReasons(): string[] {
    return this.#modReportReasons;
  }

  /**
   * The absolute `https://www.reddit.com` URL for the comment.
   *
   * @example "https://www.reddit.com/r/wallstreetbets/comments/abc123/post/def456/"
   */
  get url(): string {
    return this.#url;
  }

  /** Whether reports on the comment are being ignored. */
  get ignoringReports(): boolean {
    return this.#ignoringReports;
  }

  /** The author's subreddit flair, or `undefined` when unavailable. */
  get authorFlair(): CommonFlair | undefined {
    return this.#authorFlair;
  }

  /** Returns the public fields included when the comment is serialized. */
  toJSON(): Pick<
    Comment,
    | 'id'
    | 'authorName'
    | 'subredditId'
    | 'subredditName'
    | 'body'
    | 'createdAt'
    | 'parentId'
    | 'postId'
    | 'replies'
    | 'approved'
    | 'locked'
    | 'removed'
    | 'stickied'
    | 'spam'
    | 'edited'
    | 'distinguishedBy'
    | 'numReports'
    | 'collapsedBecauseCrowdControl'
    | 'score'
    | 'permalink'
    | 'userReportReasons'
    | 'modReports'
    | 'modReportReasons'
    | 'url'
    | 'ignoringReports'
    | 'authorFlair'
  > {
    return {
      id: this.id,
      authorName: this.authorName,
      subredditId: this.subredditId,
      subredditName: this.subredditName,
      body: this.body,
      createdAt: this.createdAt,
      parentId: this.parentId,
      postId: this.postId,
      replies: this.replies,
      approved: this.approved,
      locked: this.locked,
      removed: this.removed,
      stickied: this.stickied,
      spam: this.spam,
      edited: this.edited,
      distinguishedBy: this.distinguishedBy,
      numReports: this.numReports,
      collapsedBecauseCrowdControl: this.collapsedBecauseCrowdControl,
      score: this.score,
      permalink: this.permalink,
      modReports: this.modReports,
      modReportReasons: this.modReportReasons,
      userReportReasons: this.userReportReasons,
      url: this.url,
      ignoringReports: this.ignoringReports,
      authorFlair: this.authorFlair,
    };
  }

  /** The comment's locked state. */
  isLocked(): boolean {
    return this.#locked;
  }

  /** The comment's approval state. */
  isApproved(): boolean {
    return this.#approved;
  }

  /** The comment's removal state. */
  isRemoved(): boolean {
    return this.#removed;
  }

  /** The comment's spam state. */
  isSpam(): boolean {
    return this.#spam;
  }

  /** The comment's stickied state. */
  isStickied(): boolean {
    return this.#stickied;
  }

  /** The comment's distinguished category state. */
  isDistinguished(): boolean {
    return Boolean(this.#distinguishedBy);
  }

  /** The comment's edited state. */
  isEdited(): boolean {
    return this.#edited;
  }

  /** The comment's report-ignore state. */
  isIgnoringReports(): boolean {
    return this.#ignoringReports;
  }

  /**
   * Deletes the comment as the app account.
   *
   * The `runAs` option is ignored when editing a comment.
   */
  async delete(): Promise<void> {
    return Comment.delete(this.id);
  }

  /**
   * Replaces the comment body as the app account, then updates the cached body
   * and edited state from the response.
   *
   * The `runAs` option is ignored when editing a comment.
   */
  async edit(opts: Readonly<EditCommentOptions>): Promise<this> {
    const newComment = await Comment.edit({ id: this.id, ...opts });

    this.#body = newComment.body;
    this.#edited = newComment.edited;

    return this;
  }

  /** Approves the comment and updates this instance's moderation state. */
  async approve(): Promise<void> {
    await Comment.approve(this.id);
    this.#approved = true;
    this.#removed = false;
  }

  /**
   * Removes the comment and updates this instance's moderation state.
   *
   * @param isSpam - Whether to classify the removed comment as spam.
   */
  async remove(isSpam: boolean = false): Promise<void> {
    await Comment.remove(this.id, isSpam);
    this.#removed = true;
    this.#spam = isSpam;
    this.#approved = false;
  }

  /**
   * Filters the comment. When a comment is filtered, it is added to the ModQueue for review, and in addition:
   * - if @param options.keep is `false`, the comment stops being in displayed the subreddit
   * - if @param options.keep is `true`, the comment is still displayed in the subreddit
   *
   * @experimental
   */
  async filter(options?: FilterOptions): Promise<void> {
    await filterThing(this.id, options, context.metadata);
    this.#removed = !options?.keep;
    this.#spam = false;
    this.#approved = false;
  }

  /** Disables new replies and updates this instance's locked state. */
  async lock(): Promise<void> {
    await Comment.lock(this.id);
    this.#locked = true;
  }

  /** Enables new replies and updates this instance's locked state. */
  async unlock(): Promise<void> {
    await Comment.unlock(this.id);
    this.#locked = false;
  }

  /** Creates a direct reply to the comment. */
  async reply(opts: Readonly<ReplyToCommentOptions>): Promise<Comment> {
    return Comment.submit({ id: this.id, ...opts });
  }

  /** Fetches the author's account, or `undefined` if it is unavailable. */
  async getAuthor(): Promise<User | undefined> {
    return User.getByUsername(this.#authorName);
  }

  /**
   * Distinguishes the comment as a moderator and updates this instance.
   *
   * @param makeSticky - Whether to pin the comment to the top of its thread.
   */
  async distinguish(makeSticky: boolean = false): Promise<void> {
    const { distinguishedBy, stickied } = await Comment.distinguish(this.id, makeSticky, false);
    this.#distinguishedBy = distinguishedBy;
    this.#stickied = stickied;
  }

  /**
   * Distinguishes the comment as an employee and updates this instance.
   *
   * @param makeSticky - Whether to pin the comment to the top of its thread.
   */
  async distinguishAsAdmin(makeSticky: boolean = false): Promise<void> {
    const { distinguishedBy, stickied } = await Comment.distinguish(this.id, makeSticky, true);
    this.#distinguishedBy = distinguishedBy;
    this.#stickied = stickied;
  }

  /**
   * Removes the distinction category and sticky status and updates this
   * instance.
   */
  async undistinguish(): Promise<void> {
    const { distinguishedBy, stickied } = await Comment.undistinguish(this.id);
    this.#distinguishedBy = distinguishedBy;
    this.#stickied = stickied;
  }

  /** Ignores reports and updates this instance's report-ignore state. */
  async ignoreReports(): Promise<void> {
    await Comment.ignoreReports(this.id);
    this.#ignoringReports = true;
  }

  /** Stops ignoring reports and updates this instance's cached state. */
  async unignoreReports(): Promise<void> {
    await Comment.unignoreReports(this.id);
    this.#ignoringReports = false;
  }

  /**
   * Snoozes subsequent reports with the same reason from the same users for
   * seven days. This only works for free-form reports.
   *
   * @param reason - The report reason to snooze.
   */
  async snoozeReports(reason: string): Promise<void> {
    await Comment.snoozeReports(this.id, reason);
  }

  /**
   * Unsnoozes reports with the given reason. This only works for free-form
   * reports.
   *
   * @param reason - The report reason to unsnooze.
   */
  async unsnoozeReports(reason: string): Promise<void> {
    await Comment.unsnoozeReports(this.id, reason);
  }

  /**
   * Prevents Crowd Control from collapsing the comment. Other rules can still
   * collapse it.
   */
  async showComment(): Promise<void> {
    await Comment.showComment(this.id);
    this.#removed = false;
  }

  /**
   * Adds a moderator note explaining why the comment was removed.
   */
  addRemovalNote(opts: Readonly<Omit<AddRemovalNoteOptions, 'itemIds'>>): Promise<void> {
    return ModNote.addRemovalNote({ itemIds: [this.#id], ...opts });
  }

  /** @internal */
  static async getById(id: T1): Promise<Comment> {
    const client = getRedditApiPlugins().LinksAndComments;

    const commentId: T1 = isT1(id) ? id : `t1_${id}`;

    const response = await client.Info(
      {
        subreddits: [],
        thingIds: [commentId],
      },
      this.#metadata
    );

    if (!response.data?.children?.[0]?.data) {
      throw new Error('not found');
    }

    return new Comment(response.data.children[0].data);
  }

  /** @internal */
  static getComments(opts: Readonly<GetCommentsOptions>): Listing<Comment> {
    const { postId, commentId, ...rest } = opts;
    return Comment.#getCommentsListing({
      postId: T3(postId),
      commentId: commentId ? T1(commentId) : undefined,
      ...rest,
    });
  }

  /** @internal */
  static async edit(opts: Readonly<CommentSubmissionOptions & { id: T1 }>): Promise<Comment> {
    const client = getRedditApiPlugins().LinksAndComments;

    const { id } = opts;

    let richtextString: string | undefined;
    if ('richtext' in opts) {
      richtextString = richtextToString(opts.richtext);
    }

    const response = await client.EditUserText(
      {
        thingId: id,
        text: 'text' in opts ? opts.text : '',
        richtextJson: richtextString,
        runAs: RunAs.APP,
      },
      this.#metadata
    );

    if (response.json?.errors?.length) {
      throw new Error('Failed to edit comment');
    }

    const comment = response.json?.data?.things?.[0]?.data;
    assertNonNull(comment);

    return new Comment(comment);
  }

  /** @internal */
  static async delete(id: T1): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Del(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async approve(id: T1): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.Approve(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async remove(id: T1, isSpam: boolean = false): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.Remove(
      {
        id,
        spam: isSpam,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async lock(id: T1): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Lock(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async unlock(id: T1): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Unlock(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async submit(options: CommentSubmissionOptions & { id: T1 | T3 }): Promise<Comment> {
    const { runAs = 'APP' } = options;
    const runAsType = RunAs[runAs];
    const client =
      runAsType === RunAs.USER ? getUserActionsPlugin() : getRedditApiPlugins().LinksAndComments;

    if (runAsType === RunAs.USER) {
      assertUserScope(Scope.SUBMIT_COMMENT);
    }
    const { id } = options;

    let richtextString: string | undefined;
    if ('richtext' in options) {
      richtextString = richtextToString(options.richtext);
    }

    const response = await client.Comment(
      {
        thingId: id,
        text: 'text' in options ? options.text : '',
        richtextJson: richtextString,
        runAs: runAsType,
      },
      this.#metadata
    );

    // TODO: figure out a better errors to throw
    if (response.json?.errors?.length) {
      throw new Error('failed to reply to comment');
    }

    const data = response.json?.data?.things?.[0]?.data;
    assertNonNull(data);

    return new Comment(data);
  }

  /** @internal */
  static async distinguish(
    id: T1,
    sticky: boolean,
    asAdmin: boolean
  ): Promise<{
    distinguishedBy: string | undefined;
    stickied: boolean;
  }> {
    const client = getRedditApiPlugins().Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: asAdmin ? 'admin' : 'yes',
        sticky,
      },
      this.#metadata
    );

    const comment = response.json?.data?.things?.[0]?.data;

    assertNonNull(comment);

    return {
      distinguishedBy: comment.distinguished,
      stickied: Boolean(comment.stickied),
    };
  }

  /** @internal */
  static async undistinguish(id: T1): Promise<{
    distinguishedBy: string | undefined;
    stickied: boolean;
  }> {
    const client = getRedditApiPlugins().Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: 'no',
        sticky: false,
      },
      this.#metadata
    );

    const comment = response.json?.data?.things?.[0]?.data;

    assertNonNull(comment);

    return {
      distinguishedBy: comment.distinguished,
      stickied: Boolean(comment.stickied),
    };
  }

  /** @internal */
  static getCommentsByUser(options: GetCommentsByUserOptions): Listing<Comment> {
    const client = getRedditApiPlugins().Users;
    return new Listing<Comment>({
      hasMore: true,
      before: options.before,
      after: options.after,
      pageSize: options.pageSize,
      limit: options.limit,
      fetch: async (fetchOptions) => {
        const response = await client.UserWhere(
          {
            username: options.username,
            where: 'comments',
            ...fetchOptions,
          },
          this.#metadata
        );

        assertNonNull(response.data, 'Failed to get comments for user');

        const children = response.data.children?.map((child) => new Comment(child.data!)) || [];

        return {
          children,
          before: response.data.before,
          after: response.data.after,
        };
      },
    });
  }

  /** @internal */
  static async ignoreReports(id: T1): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.IgnoreReports(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async unignoreReports(id: T1): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.UnignoreReports(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async snoozeReports(id: T1, reason: string): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.SnoozeReports(
      {
        id,
        reason,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async unsnoozeReports(id: T1, reason: string): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.UnsnoozeReports(
      {
        id,
        reason,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async showComment(id: T1): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.ShowComment(
      {
        id,
      },
      this.#metadata
    );
  }

  static #getCommentsListing(
    options: GetCommentsListingOptions,
    depthOffset = 0
  ): Listing<Comment> {
    return new Listing<Comment>({
      limit: options.limit,
      pageSize: options.pageSize,
      fetch: async (fetchOptions: ListingFetchOptions) => {
        let limit = fetchOptions.limit;

        const listingsClient = getRedditApiPlugins().Listings;
        const linksAndCommentsClient = getRedditApiPlugins().LinksAndComments;
        let commentId = options.commentId;

        if (fetchOptions.more) {
          if (fetchOptions.more.children.length) {
            const more = fetchOptions.more;

            // The maximum page size for MoreChildren is 100
            if (!limit || limit > 100) {
              limit = 100;
            }

            const moreIds = more.children.splice(0, limit);

            const response = await linksAndCommentsClient.MoreChildren(
              {
                linkId: options.postId,
                children: moreIds,
                sort: options.sort,
              },
              this.#metadata
            );

            if (!response.json?.data?.things?.length) {
              return { children: [] };
            }

            const { children } = Comment.#buildCommentsTree(
              response.json.data.things,
              options.postId,
              options
            );

            return { children, more: more.children.length ? more : undefined };
          } else {
            // parentId is only ever T3 for the MoreChildren case.
            commentId = fetchOptions.more.parentId as T1;
            depthOffset = depthOffset + fetchOptions.more.depth;
          }
        }

        const response = await listingsClient.Comments(
          {
            article: options.postId.substring(3),
            comment: commentId?.substring(3),
            limit,
            depth: options.depth,
            sort: options.sort,
          },
          this.#metadata
        );

        // The first item of `response.listings` is always the post (t3) listing
        // and the second item is the comments (t1) listing.
        let responseChildren = response.listings?.[1]?.data?.children ?? [];

        const topLevelComment = responseChildren[0];
        if (commentId && topLevelComment?.data?.replyList?.data) {
          responseChildren = topLevelComment.data.replyList.data.children;
        }

        return Comment.#buildCommentsTree(
          responseChildren,
          commentId ?? options.postId,
          options,
          depthOffset
        );
      },
    });
  }

  static #buildCommentsTree(
    redditObjects: WrappedRedditObject[] | JsonWrappedComment_WrappedComment[],
    parentId: T1 | T3,
    options: GetCommentsOptions,
    depthOffset: number = 0
  ): ListingFetchResponse<Comment> {
    const children: Comment[] = [];
    let more: MoreObject | undefined;

    // Map comments so replies returned by MoreChildren can be attached to
    // their parents.
    const commentsMap: { [id: string]: Comment } = {};

    for (const child of redditObjects) {
      if (!child.data) {
        continue;
      }

      if (child.data.depth != null) {
        child.data.depth = child.data.depth + depthOffset;
      }

      // Prevent returning comments that are beyond the maximum depth requested.
      if (child.data.depth != null && options.depth != null && child.data.depth >= options.depth) {
        continue;
      }

      const parentComment = child.data.parentId ? commentsMap[child.data.parentId] : undefined;

      if (child.kind === 't1') {
        // MoreChildren sometimes returns a comment that has already been
        // seen.
        if (child.data.name === parentId) {
          continue;
        }

        const comment = new Comment(child.data);

        commentsMap[comment.id] = comment;

        comment.#replies = Comment.#getCommentsListing(
          {
            ...options,
            postId: comment.postId,
            commentId: comment.id,
          },
          depthOffset
        );

        // Preload the comment's replies Listing
        if ('replyList' in child.data && child.data.replyList?.data) {
          const { children, more } = Comment.#buildCommentsTree(
            child.data.replyList.data.children,
            comment.id,
            options,
            depthOffset
          );

          if (children.length) {
            comment.replies.children.push(...children);
          }

          if (more) {
            comment.replies.setMore(more);
          }
        }

        // The replies for this comment are already loaded, so skip the first
        // fetch call.
        comment.replies.preventInitialFetch();

        if (parentComment) {
          parentComment.replies.children.push(comment);
        } else {
          children.push(comment);
        }
      } else if (child.kind === 'more' && child.data.parentId && child.data.depth != null) {
        const thisMore = {
          parentId: asTid<T1 | T3>(child.data.parentId),
          children: child.data.children ?? [],
          depth: child.data.depth,
        };

        if (parentComment) {
          parentComment.replies.setMore(thisMore);
        } else if (thisMore.parentId === parentId) {
          more = thisMore;
        }
      }
    }

    return { children, more };
  }

  static get #metadata(): Metadata {
    return context.metadata;
  }
}
