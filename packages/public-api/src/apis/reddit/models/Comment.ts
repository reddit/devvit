import type {
  Comment as CommentProto,
  JsonWrappedComment_WrappedComment,
  Metadata,
  RedditObject,
  WrappedRedditObject,
} from '@devvit/protos';
import { Scope } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';

import { Devvit } from '../../../devvit/Devvit.js';
import type { T1ID, T2ID, T3ID, T5ID } from '../../../types/tid.js';
import { asT1ID, asT2ID, asT3ID, asT5ID, isCommentId, isT1ID } from '../../../types/tid.js';
import { RunAs } from '../common.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { richtextToString } from '../helpers/richtextToString.js';
import type { CommonFlair } from './Flair.js';
import { convertProtosFlairToCommonFlair } from './Flair.js';
import type { ListingFetchOptions, ListingFetchResponse, MoreObject } from './Listing.js';
import { Listing } from './Listing.js';
import { ModNote } from './ModNote.js';
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
  postId: string;
  commentId?: string | undefined;
  depth?: number;
  pageSize?: number;
  limit?: number;
  sort?: CommentSort;
};

type GetCommentsListingOptions = {
  postId: T3ID;
  commentId?: T1ID;
  depth?: number;
  pageSize?: number;
  limit?: number;
  sort?: CommentSort;
};

export type CommentSubmissionOptions =
  | {
      text: string;
      runAs?: 'USER' | 'APP';
    }
  | {
      richtext: object | RichTextBuilder;
      runAs?: 'USER' | 'APP';
    };

export type EditCommentOptions = CommentSubmissionOptions;
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
  #id: T1ID;
  #authorId?: T2ID;
  #authorName: string;
  #body: string;
  #createdAt: Date;
  #parentId: T1ID | T3ID;
  #postId: T3ID;
  #subredditId: T5ID;
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
  #distinguishedBy?: string;
  #numReports: number;
  #collapsedBecauseCrowdControl: boolean;
  #score: number;
  #permalink: string;
  #modReportReasons: string[];
  #userReportReasons: string[];
  #url: string;
  #ignoringReports: boolean;
  #authorFlair?: CommonFlair;

  #metadata: Metadata | undefined;

  /**
   * @internal
   */
  constructor(data: RedditObject | CommentProto, metadata: Metadata | undefined) {
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

    this.#id = asT1ID(`t1_${data.id}`);
    this.#authorId = data.authorFullname ? asT2ID(data.authorFullname) : undefined;
    this.#authorName = data.author;
    this.#body = data.body;
    this.#subredditId = asT5ID(data.subredditId);
    this.#subredditName = data.subreddit;
    this.#parentId = isCommentId(data.parentId) ? asT1ID(data.parentId) : asT3ID(data.parentId);
    this.#postId = asT3ID(data.linkId);
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

    this.#modReportReasons = ((data.modReports as unknown as [string, string]) ?? []).map(
      ([reason]) => reason
    );
    this.#userReportReasons = ((data.userReports as unknown as [string, string]) ?? []).map(
      ([reason]) => reason
    );

    const createdAt = new Date(0);
    createdAt.setUTCSeconds(data.createdUtc);
    this.#createdAt = createdAt;

    this.#replies = Comment.#getCommentsListing(
      {
        postId: this.#postId,
        commentId: this.#id,
      },
      metadata
    );

    this.#metadata = metadata;
  }

  get id(): T1ID {
    return this.#id;
  }

  get authorId(): T2ID | undefined {
    return this.#authorId;
  }

  get authorName(): string {
    return this.#authorName;
  }

  get subredditId(): T5ID {
    return this.#subredditId;
  }

  get subredditName(): string {
    return this.#subredditName;
  }

  get body(): string {
    return this.#body;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get parentId(): T1ID | T3ID {
    return this.#parentId;
  }

  get postId(): T3ID {
    return this.#postId;
  }

  get replies(): Listing<Comment> {
    return this.#replies;
  }

  get distinguishedBy(): string | undefined {
    return this.#distinguishedBy;
  }

  get locked(): boolean {
    return this.#locked;
  }

  get stickied(): boolean {
    return this.#stickied;
  }

  get removed(): boolean {
    return this.#removed;
  }

  get approved(): boolean {
    return this.#approved;
  }

  /**
   * A number representing the UTC timestamp in seconds, or 0 if its not approved.
   */
  get approvedAtUtc(): number {
    return this.#approvedAtUtc;
  }

  get bannedAtUtc(): number {
    return this.#bannedAtUtc;
  }

  get spam(): boolean {
    return this.#spam;
  }

  get edited(): boolean {
    return this.#edited;
  }

  get numReports(): number {
    return this.#numReports;
  }

  get collapsedBecauseCrowdControl(): boolean {
    return this.#collapsedBecauseCrowdControl;
  }

  get score(): number {
    return this.#score;
  }

  get permalink(): string {
    return this.#permalink;
  }

  get userReportReasons(): string[] {
    return this.#userReportReasons;
  }

  get modReportReasons(): string[] {
    return this.#modReportReasons;
  }

  get url(): string {
    return this.#url;
  }

  get ignoringReports(): boolean {
    return this.#ignoringReports;
  }

  get authorFlair(): CommonFlair | undefined {
    return this.#authorFlair;
  }

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
      modReportReasons: this.modReportReasons,
      userReportReasons: this.userReportReasons,
      url: this.url,
      ignoringReports: this.ignoringReports,
      authorFlair: this.#authorFlair,
    };
  }

  isLocked(): boolean {
    return this.#locked;
  }

  isApproved(): boolean {
    return this.#approved;
  }

  isRemoved(): boolean {
    return this.#removed;
  }

  isSpam(): boolean {
    return this.#spam;
  }

  isStickied(): boolean {
    return this.#stickied;
  }

  isDistinguished(): boolean {
    return Boolean(this.#distinguishedBy);
  }

  isEdited(): boolean {
    return this.#edited;
  }

  isIgnoringReports(): boolean {
    return this.#ignoringReports;
  }

  async delete(): Promise<void> {
    return Comment.delete(this.id, this.#metadata);
  }

  async edit(options: EditCommentOptions): Promise<this> {
    const newComment = await Comment.edit(
      {
        id: this.id,
        ...options,
      },
      this.#metadata
    );

    this.#body = newComment.body;
    this.#edited = newComment.edited;

    return this;
  }

  async approve(): Promise<void> {
    await Comment.approve(this.id, this.#metadata);
    this.#approved = true;
    this.#removed = false;
  }

  async remove(isSpam: boolean = false): Promise<void> {
    await Comment.remove(this.id, isSpam, this.#metadata);
    this.#removed = true;
    this.#spam = isSpam;
    this.#approved = false;
  }

  async lock(): Promise<void> {
    await Comment.lock(this.id, this.#metadata);
    this.#locked = true;
  }

  async unlock(): Promise<void> {
    await Comment.unlock(this.id, this.#metadata);
    this.#locked = false;
  }

  async reply(options: ReplyToCommentOptions): Promise<Comment> {
    return Comment.submit(
      {
        id: this.id,
        ...options,
      },
      this.#metadata
    );
  }

  async getAuthor(): Promise<User | undefined> {
    return User.getByUsername(this.#authorName, this.#metadata);
  }

  async distinguish(makeSticky: boolean = false): Promise<void> {
    const { distinguishedBy, stickied } = await Comment.distinguish(
      this.id,
      makeSticky,
      false,
      this.#metadata
    );
    this.#distinguishedBy = distinguishedBy;
    this.#stickied = stickied;
  }

  async distinguishAsAdmin(makeSticky: boolean = false): Promise<void> {
    const { distinguishedBy, stickied } = await Comment.distinguish(
      this.id,
      makeSticky,
      true,
      this.#metadata
    );
    this.#distinguishedBy = distinguishedBy;
    this.#stickied = stickied;
  }

  async undistinguish(): Promise<void> {
    const { distinguishedBy, stickied } = await Comment.undistinguish(this.id, this.#metadata);
    this.#distinguishedBy = distinguishedBy;
    this.#stickied = stickied;
  }

  async ignoreReports(): Promise<void> {
    await Comment.ignoreReports(this.id, this.#metadata);
    this.#ignoringReports = true;
  }

  async unignoreReports(): Promise<void> {
    await Comment.unignoreReports(this.id, this.#metadata);
    this.#ignoringReports = false;
  }

  /**
   * Add a mod note for why the comment was removed
   *
   * @param options.reasonId id of a Removal Reason - you can leave this as an empty string if you don't have one
   * @param options.modNote the reason for removal (maximum 100 characters) (optional)
   * @returns
   */
  addRemovalNote(options: { reasonId: string; modNote?: string }): Promise<void> {
    return ModNote.addRemovalNote({ itemIds: [this.#id], ...options }, this.#metadata);
  }

  /** @internal */
  static async getById(id: T1ID, metadata: Metadata | undefined): Promise<Comment> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    const commentId: T1ID = isT1ID(id) ? id : `t1_${id}`;

    const response = await client.Info(
      {
        subreddits: [],
        thingIds: [commentId],
      },
      metadata
    );

    if (!response.data?.children?.[0]?.data) {
      throw new Error('not found');
    }

    return new Comment(response.data.children[0].data, metadata);
  }

  /** @internal */
  static getComments(
    options: GetCommentsOptions,
    metadata: Metadata | undefined
  ): Listing<Comment> {
    const { postId, commentId, ...rest } = options;
    return Comment.#getCommentsListing(
      {
        postId: asT3ID(postId),
        commentId: commentId ? asT1ID(commentId) : undefined,
        ...rest,
      },
      metadata
    );
  }

  /** @internal */
  static async edit(
    options: CommentSubmissionOptions & { id: T1ID },
    metadata: Metadata | undefined
  ): Promise<Comment> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    const { id } = options;

    let richtextString: string | undefined;
    if ('richtext' in options) {
      richtextString = richtextToString(options.richtext);
    }

    const response = await client.EditUserText(
      {
        thingId: id,
        text: 'text' in options ? options.text : '',
        richtextJson: richtextString,
        runAs: RunAs.APP,
      },
      metadata
    );

    if (response.json?.errors?.length) {
      throw new Error('Failed to edit comment');
    }

    const comment = response.json?.data?.things?.[0]?.data;
    assertNonNull(comment);

    return new Comment(comment, metadata);
  }

  /** @internal */
  static async delete(id: T1ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Del(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async approve(id: T1ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.Moderation;

    await client.Approve(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async remove(
    id: T1ID,
    isSpam: boolean = false,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Moderation;

    await client.Remove(
      {
        id,
        spam: isSpam,
      },
      metadata
    );
  }

  /** @internal */
  static async lock(id: T1ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Lock(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async unlock(id: T1ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Unlock(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async submit(
    options: CommentSubmissionOptions & { id: T1ID | T3ID },
    metadata: Metadata | undefined
  ): Promise<Comment> {
    const { runAs = 'APP' } = options;
    const runAsType = RunAs[runAs];
    const client =
      runAsType === RunAs.USER
        ? Devvit.userActionsPlugin
        : Devvit.redditAPIPlugins.LinksAndComments;
    const { id } = options;

    if (runAsType === RunAs.USER) {
      Devvit.assertUserScope(Scope.SUBMIT_COMMENT);
    }

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
      metadata
    );

    // TODO: figure out a better errors to throw
    if (response.json?.errors?.length) {
      throw new Error('failed to reply to comment');
    }

    const data = response.json?.data?.things?.[0]?.data;
    assertNonNull(data);

    return new Comment(data, metadata);
  }

  /** @internal */
  static async distinguish(
    id: T1ID,
    sticky: boolean,
    asAdmin: boolean,
    metadata: Metadata | undefined
  ): Promise<{
    distinguishedBy: string | undefined;
    stickied: boolean;
  }> {
    const client = Devvit.redditAPIPlugins.Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: asAdmin ? 'admin' : 'yes',
        sticky,
      },
      metadata
    );

    const comment = response.json?.data?.things?.[0]?.data;

    assertNonNull(comment);

    return {
      distinguishedBy: comment.distinguished,
      stickied: Boolean(comment.stickied),
    };
  }

  /** @internal */
  static async undistinguish(
    id: T1ID,
    metadata: Metadata | undefined
  ): Promise<{
    distinguishedBy: string | undefined;
    stickied: boolean;
  }> {
    const client = Devvit.redditAPIPlugins.Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: 'no',
        sticky: false,
      },
      metadata
    );

    const comment = response.json?.data?.things?.[0]?.data;

    assertNonNull(comment);

    return {
      distinguishedBy: comment.distinguished,
      stickied: Boolean(comment.stickied),
    };
  }

  /** @internal */
  static getCommentsByUser(
    options: GetCommentsByUserOptions,
    metadata: Metadata | undefined
  ): Listing<Comment> {
    const client = Devvit.redditAPIPlugins.Users;
    return new Listing<Comment>({
      hasMore: true,
      before: options.before,
      after: options.after,
      pageSize: options.pageSize,
      limit: options.limit,
      async fetch(fetchOptions) {
        const response = await client.UserWhere(
          {
            username: options.username,
            where: 'comments',
            ...fetchOptions,
          },
          metadata
        );

        assertNonNull(response.data, 'Failed to get comments for user');

        const children =
          response.data.children?.map((child) => new Comment(child.data!, metadata)) || [];

        return {
          children,
          before: response.data.before,
          after: response.data.after,
        };
      },
    });
  }

  /** @internal */
  static async ignoreReports(id: T1ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.Moderation;

    await client.IgnoreReports(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async unignoreReports(id: T1ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.Moderation;

    await client.UnignoreReports(
      {
        id,
      },
      metadata
    );
  }

  static #getCommentsListing(
    options: GetCommentsListingOptions,
    metadata: Metadata | undefined,
    depthOffset = 0
  ): Listing<Comment> {
    return new Listing<Comment>({
      limit: options.limit,
      pageSize: options.pageSize,
      fetch: async (fetchOptions: ListingFetchOptions) => {
        let limit = fetchOptions.limit;

        const listingsClient = Devvit.redditAPIPlugins.Listings;
        const linksAndCommentsClient = Devvit.redditAPIPlugins.LinksAndComments;
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
              metadata
            );

            if (!response.json?.data?.things?.length) {
              return { children: [] };
            }

            const { children } = Comment.#buildCommentsTree(
              response.json.data.things,
              options.postId,
              options,
              metadata
            );

            return { children, more: more.children.length ? more : undefined };
          } else {
            // parentId is only ever T3 for the MoreChildren case.
            commentId = fetchOptions.more.parentId as T1ID;
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
          metadata
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
          metadata,
          depthOffset
        );
      },
    });
  }

  static #buildCommentsTree(
    redditObjects: WrappedRedditObject[] | JsonWrappedComment_WrappedComment[],
    parentId: string,
    options: GetCommentsOptions,
    metadata: Metadata | undefined,
    depthOffset: number = 0
  ): ListingFetchResponse<Comment> {
    const children: Comment[] = [];
    let more: MoreObject | undefined;

    // Map of comments to help set parent-child relationship between comments returned by MoreChildren.
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
        // Sometimes MoreChildren API returns a comment that has already been seen.
        if (child.data.name === parentId) {
          continue;
        }

        const comment = new Comment(child.data, metadata);

        commentsMap[comment.id] = comment;

        comment.#replies = Comment.#getCommentsListing(
          {
            ...options,
            postId: comment.postId,
            commentId: comment.id,
          },
          metadata,
          depthOffset
        );

        // Preload the comment's replies Listing
        if ('replyList' in child.data && child.data.replyList?.data) {
          const { children, more } = Comment.#buildCommentsTree(
            child.data.replyList.data.children,
            comment.id,
            options,
            metadata,
            depthOffset
          );

          if (children.length) {
            comment.replies.children.push(...children);
          }

          if (more) {
            comment.replies.setMore(more);
          }
        }

        // Since the replies for this comment were already load we can skip the first fetch call
        comment.replies.preventInitialFetch();

        if (parentComment) {
          parentComment.replies.children.push(comment);
        } else {
          children.push(comment);
        }
      } else if (child.kind === 'more' && child.data.parentId && child.data.depth != null) {
        const thisMore = {
          parentId: isCommentId(child.data.parentId)
            ? asT1ID(child.data.parentId)
            : asT3ID(child.data.parentId),
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
}
