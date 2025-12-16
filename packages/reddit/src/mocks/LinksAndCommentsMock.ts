import { type JsonStatus } from '@devvit/protos/json/devvit/plugin/redditapi/common/common_msg.js';
import type {
  BasicIdRequest,
  CommentRequest,
  EditCustomPostRequest,
  FollowPostRequest,
  InfoRequest,
  JsonWrappedComment,
  MoreChildrenRequest,
  ReportAwardRequest,
  ReportRequest,
  SaveRequest,
  SendRepliesRequest,
  SetContestModeRequest,
  SetCustomPostPreviewRequest,
  SetSubredditStickyRequest,
  SetSuggestedSortRequest,
  SubmitRequest,
  VoteRequest,
} from '@devvit/protos/json/devvit/plugin/redditapi/linksandcomments/linksandcomments_msg.js';
import type { Comment } from '@devvit/protos/json/devvit/reddit/comment.js';
import type { Empty } from '@devvit/protos/json/google/protobuf/empty.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type {
  JsonRedditObjects,
  Listing,
} from '@devvit/protos/types/devvit/plugin/redditapi/common/common_msg.js';
// eslint-disable-next-line no-restricted-imports
import { type RedditObject } from '@devvit/protos/types/devvit/plugin/redditapi/common/common_msg.js';
// eslint-disable-next-line no-restricted-imports
import type { SubmitResponse } from '@devvit/protos/types/devvit/plugin/redditapi/linksandcomments/linksandcomments_msg.js';
// eslint-disable-next-line no-restricted-imports
import { type LinksAndComments } from '@devvit/protos/types/devvit/plugin/redditapi/linksandcomments/linksandcomments_svc.js';
import { type JsonObject, T3 } from '@devvit/shared';
import type { PluginMock } from '@devvit/shared-types/test/index.js';

const DEFAULT_REDDIT_OBJECT: Readonly<RedditObject> = {
  allAwardings: [],
  approved: false,
  approvedAtUtc: 0,
  approvedBy: '',
  archived: false,
  associatedAward: '',
  author: '',
  authorFlairBackgroundColor: '',
  authorFlairCssClass: '',
  authorFlairRichtext: [],
  authorFlairTemplateId: '',
  authorFlairText: '',
  authorFlairTextColor: '',
  authorFlairType: '',
  authorFullname: '',
  authorIsBlocked: false,
  authorPatreonFlair: false,
  authorPremium: false,
  awarders: [],
  bannedAtUtc: 0,
  bannedBy: '',
  body: '',
  bodyHtml: '',
  canGild: false,
  canModPost: false,
  children: [],
  collapsed: false,
  collapsedBecauseCrowdControl: false,
  collapsedReason: '',
  collapsedReasonCode: '',
  commentType: '',
  controversiality: 0,
  count: 0,
  created: 0,
  createdUtc: 0,
  depth: 0,
  displayName: '',
  distinguished: '',
  downs: 0,
  edited: false,
  gallery: [],
  gilded: 0,
  gildings: undefined,
  hidden: false,
  id: '',
  ignoreReports: false,
  isSubmitter: false,
  likes: false,
  linkAuthor: '',
  linkFlairBackgroundColor: '',
  linkFlairCssClass: '',
  linkFlairRichtext: [],
  linkFlairTemplateId: '',
  linkFlairText: '',
  linkFlairTextColor: '',
  linkFlairType: '',
  linkId: '',
  linkPermalink: '',
  linkTitle: '',
  linkUrl: '',
  locked: false,
  modNote: '',
  modPermissions: [],
  modReasonBy: '',
  modReasonTitle: '',
  modReports: [],
  name: '',
  noFollow: false,
  numComments: 0,
  numReports: 0,
  over18: false,
  parentId: '',
  permalink: '',
  quarantine: false,
  removalReason: '',
  removed: false,
  removedBy: '',
  removedByCategory: '',
  replies: '',
  replyList: undefined,
  reportReasons: [],
  rteMode: '',
  saved: false,
  score: 0,
  scoreHidden: false,
  secureMedia: undefined,
  selftext: '',
  selftextHtml: '',
  sendReplies: false,
  spam: false,
  spoiler: false,
  stickied: false,
  subreddit: '',
  subredditId: '',
  subredditNamePrefixed: '',
  subredditType: '',
  thumbnail: '',
  thumbnailHeight: 0,
  thumbnailWidth: 0,
  title: '',
  topAwardedType: '',
  totalAwardsReceived: 0,
  treatmentTags: [],
  unrepliableReason: '',
  ups: 0,
  url: '',
  userReports: [],
};

const DEFAULT_COMMENT: Readonly<Comment> = {
  allAwardings: [],
  approved: false,
  approvedAtUtc: 0,
  approvedBy: '',
  archived: false,
  associatedAward: '',
  author: '',
  authorFlairBackgroundColor: '',
  authorFlairCssClass: '',
  authorFlairRichtext: [],
  authorFlairTemplateId: '',
  authorFlairText: '',
  authorFlairTextColor: '',
  authorFlairType: '',
  authorFullname: '',
  authorIsBlocked: false,
  authorPatreonFlair: false,
  authorPremium: false,
  awarders: [],
  banInfo: undefined,
  bannedAtUtc: 0,
  bannedBy: '',
  body: '',
  bodyHtml: '',
  canGild: false,
  canModPost: false,
  children: [],
  collapsed: false,
  collapsedBecauseCrowdControl: false,
  collapsedReason: '',
  collapsedReasonCode: '',
  commentType: '',
  controversiality: 0,
  count: 0,
  created: 0,
  createdUtc: 0,
  depth: 0,
  distinguished: '',
  downs: 0,
  edited: false,
  gilded: 0,
  gildings: undefined,
  id: '',
  ignoreReports: false,
  isSubmitter: false,
  likes: false,
  linkId: '',
  locked: false,
  markedSpam: false,
  modNote: '',
  modReasonBy: '',
  modReasonTitle: '',
  modReports: [],
  name: '',
  noFollow: false,
  numReports: 0,
  parentId: '',
  permalink: '',
  removalReason: '',
  removed: false,
  replies: '',
  reportReasons: [],
  rteMode: '',
  saved: false,
  score: 0,
  scoreHidden: false,
  sendReplies: false,
  spam: false,
  stickied: false,
  subreddit: '',
  subredditId: '',
  subredditNamePrefixed: '',
  subredditType: '',
  topAwardedType: '',
  totalAwardsReceived: 0,
  treatmentTags: [],
  unrepliableReason: '',
  ups: 0,
  userReports: [],
  verdict: '',
};

function fakeId(): T3 {
  return `t3_${Math.random().toString(36).substring(7)}`;
}

type LinksAndCommentsStore = {
  posts: Map<string, RedditObject>;
  postData: Map<string, Readonly<JsonObject>>;
};

export class LinksAndCommentsPluginMock implements LinksAndComments {
  private readonly _store: LinksAndCommentsStore;

  constructor(store: LinksAndCommentsStore) {
    this._store = store;
  }

  async Comment(_request: CommentRequest, _metadata?: Metadata): Promise<JsonWrappedComment> {
    throw new Error(
      `Reddit API method Users.Friend is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Del(request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    this._store.posts.delete(request.id);
    return {};
  }

  async EditCustomPost(
    request: EditCustomPostRequest,
    _metadata?: Metadata
  ): Promise<JsonRedditObjects> {
    if (request.postData?.developerData) {
      this._store.postData.set(request.thingId, request.postData.developerData);
    }
    return { json: { errors: [], data: { things: [] } } };
  }

  async EditUserText(request: CommentRequest, _metadata?: Metadata): Promise<JsonWrappedComment> {
    const post = this._store.posts.get(request.thingId);
    if (!post) {
      throw new Error('Post not found');
    }
    post.selftext = request.text;
    post.edited = true;

    return {
      json: {
        errors: [],
        data: {
          things: [
            {
              kind: 't3',
              data: {
                ...DEFAULT_COMMENT,
                ...post,
                body: request.text,
                allAwardings: [], // Mismatch fix: RedditObject has Any[], Comment has Awarding[]
                gildings: undefined, // Mismatch fix: RedditObject has Any, Comment has Gildings
                reportReasons: [], // Mismatch fix: RedditObject has ListValue[], Comment has string[]
                treatmentTags: [], // Mismatch fix: RedditObject has Any[], Comment has string[]
                children: [], // Mismatch fix: RedditObject has ListValue, Comment has string[]
              },
            },
          ],
        },
      },
    };
  }

  async FollowPost(_request: FollowPostRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.FollowPost is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Hide(_request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.Hide is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Info(request: InfoRequest, _metadata?: Metadata): Promise<Listing> {
    const children = [];
    for (const id of request.thingIds) {
      const post = this._store.posts.get(id);
      if (post) {
        children.push({
          kind: 't3',
          data: post,
        });
      }
    }

    return {
      kind: 'Listing',
      data: {
        children,
      },
    };
  }

  async Lock(_request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.Lock is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async MarkNSFW(_request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.MarkNSFW is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async MoreChildren(
    _request: MoreChildrenRequest,
    _metadata?: Metadata
  ): Promise<JsonWrappedComment> {
    throw new Error(
      `Reddit API method LinksAndComments.MoreChildren is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Report(_request: ReportRequest, _metadata?: Metadata): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method LinksAndComments.Report is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async ReportAward(_request: ReportAwardRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.ReportAward is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Save(_request: SaveRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.Save is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SendReplies(_request: SendRepliesRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.SendReplies is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SetContestMode(_request: SetContestModeRequest, _metadata?: Metadata): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method LinksAndComments.SetContestMode is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SetCustomPostPreview(
    _request: SetCustomPostPreviewRequest,
    _metadata?: Metadata
  ): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.SetCustomPostPreview is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SetSubredditSticky(
    _request: SetSubredditStickyRequest,
    _metadata?: Metadata
  ): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method LinksAndComments.SetSubredditSticky is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SetSuggestedSort(
    _request: SetSuggestedSortRequest,
    _metadata?: Metadata
  ): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method LinksAndComments.SetSuggestedSort is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Spoiler(_request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.Spoiler is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Submit(request: SubmitRequest, _metadata?: Metadata): Promise<SubmitResponse> {
    const id = fakeId();
    const shortId = id.substring(3);

    const post: RedditObject = {
      ...DEFAULT_REDDIT_OBJECT,
      id: shortId,
      name: id,
      title: request.title,
      createdUtc: Math.floor(Date.now() / 1000),
      author: 'testuser',
      subreddit: request.sr,
      subredditId: 't5_test', // Mock subreddit ID
      url: request.url || `https://www.reddit.com/r/${request.sr}/comments/${shortId}/`,
      permalink: `/r/${request.sr}/comments/${shortId}/`,
      selftext: request.text,
      authorFullname: 't2_testuser',
    };

    this._store.posts.set(id, post);

    return {
      json: {
        data: {
          id: shortId,
          url: post.url,
          name: id,
        },
        errors: [],
      },
    };
  }

  async SubmitCustomPost(request: SubmitRequest, _metadata?: Metadata): Promise<SubmitResponse> {
    const id = fakeId();
    const shortId = id.substring(3);

    const post: RedditObject = {
      ...DEFAULT_REDDIT_OBJECT,
      id: shortId,
      name: id,
      title: request.title,
      createdUtc: Math.floor(Date.now() / 1000),
      author: 'testuser',
      subreddit: request.sr,
      subredditId: 't5_test',
      url: `https://www.reddit.com/r/${request.sr}/comments/${shortId}/`,
      permalink: `/r/${request.sr}/comments/${shortId}/`,
      selftext: '',
      authorFullname: 't2_testuser',
    };

    this._store.posts.set(id, post);

    if (request.postData?.developerData) {
      this._store.postData.set(id, request.postData.developerData);
    }

    return {
      json: {
        data: {
          id: shortId,
          url: post.url,
          name: id,
        },
        errors: [],
      },
    };
  }

  async Unhide(_request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.Unhide is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Unlock(_request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.Unlock is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async UnmarkNSFW(_request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.UnmarkNSFW is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Unsave(_request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.Unsave is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Unspoiler(_request: BasicIdRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.Unspoiler is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Vote(_request: VoteRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method LinksAndComments.Vote is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }
}

export class LinksAndCommentsMock implements PluginMock<LinksAndComments> {
  readonly plugin: LinksAndCommentsPluginMock;
  private readonly _store: LinksAndCommentsStore;

  constructor() {
    this._store = {
      posts: new Map(),
      postData: new Map(),
    };
    this.plugin = new LinksAndCommentsPluginMock(this._store);
  }

  /**
   * Retrieves developer data associated with a post.
   */
  getPostData(postId: string): JsonObject | undefined {
    return this._store.postData.get(postId);
  }

  /**
   * Seeds the mock database with a Post.
   * This allows tests to set up state before calling `reddit.getPostById`.
   */
  addPost(post: Omit<Partial<RedditObject>, 'id'> & { id: T3; title: string }): RedditObject {
    const fullId = post.id;
    const shortId = fullId.replace(/^t3_/, '');

    const newPost: RedditObject = {
      ...DEFAULT_REDDIT_OBJECT,
      createdUtc: Math.floor(Date.now() / 1000),
      author: 'testuser',
      subreddit: 'testsub',
      subredditId: 't5_test',
      url: `https://www.reddit.com/r/testsub/comments/${shortId}/`,
      permalink: `/r/testsub/comments/${shortId}/`,
      score: 0,
      numComments: 0,
      ...post,
      id: shortId,
      name: post.title,
    };

    this._store.posts.set(fullId, newPost);

    return newPost;
  }
}
