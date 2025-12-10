import type { JsonStatus, Listing, Metadata, Subreddits } from '@devvit/protos';
import type { Empty, StringValue } from '@devvit/protos/community.js';
import type {
  AboutWhereRequest,
  BasicSearchRequest,
  BasicSubredditRequest,
  BasicWhereRequest,
  DeleteSrImgRequest,
  SearchRedditNamesResponse,
  SearchSubredditsResponse,
  SiteAdminRequest,
  StickyRequest,
  StickyResponse,
  SubmitTextResponse,
  SubredditAboutEditRequest,
  SubredditAboutEditResponse,
  SubredditAboutResponse,
  SubredditAboutResponse_AboutData,
  SubredditAboutRulesResponse,
  SubredditAboutTrafficResponse,
  SubredditAddRemovalReasonRequest,
  SubredditAddRemovalReasonResponse,
  SubredditAutocompleteRequest,
  SubredditAutocompleteResponse,
  SubredditGetRemovalReasonsRequest,
  SubredditGetRemovalReasonsResponse,
  SubredditPostRequirementsResponse,
  SubredditsSearchRequest,
  SubredditsSearchResponse,
  SubredditStylesheetRequest,
  SubscribeRequest,
  UploadSrImgRequest,
  UploadSrImgResponse,
  UserSearchResponse,
  UsersSearchRequest,
} from '@devvit/protos/types/devvit/plugin/redditapi/subreddits/subreddits_msg.js';
import type { T5 } from '@devvit/shared';

type SubredditDisplayName = string;

export class SubredditMock implements Subreddits {
  private _subreddits = new Map<SubredditDisplayName, SubredditAboutResponse_AboutData>();

  async AboutWhere(_request: AboutWhereRequest, _metadata?: Metadata): Promise<Listing> {
    throw new Error(
      `Reddit API method Subreddits.AboutWhere is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async DeleteSrBanner(_request: BasicSubredditRequest, _metadata?: Metadata): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method Subreddits.DeleteSrBanner is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async DeleteSrHeader(_request: BasicSubredditRequest, _metadata?: Metadata): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method Subreddits.DeleteSrHeader is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async DeleteSrIcon(_request: BasicSubredditRequest, _metadata?: Metadata): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method Subreddits.DeleteSrIcon is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async DeleteSrImg(_request: DeleteSrImgRequest, _metadata?: Metadata): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method Subreddits.DeleteSrImg is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SearchRedditNames(
    _request: BasicSearchRequest,
    _metadata?: Metadata
  ): Promise<SearchRedditNamesResponse> {
    throw new Error(
      `Reddit API method Subreddits.SearchRedditNames is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SearchSubreddits(
    _request: BasicSearchRequest,
    _metadata?: Metadata
  ): Promise<SearchSubredditsResponse> {
    throw new Error(
      `Reddit API method Subreddits.SearchSubreddits is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Sidebar(_request: BasicSubredditRequest, _metadata?: Metadata): Promise<StringValue> {
    throw new Error(
      `Reddit API method Subreddits.Sidebar is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SiteAdmin(_request: SiteAdminRequest, _metadata?: Metadata): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method Subreddits.SiteAdmin is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Sticky(_request: StickyRequest, _metadata?: Metadata): Promise<StickyResponse> {
    throw new Error(
      `Reddit API method Subreddits.Sticky is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubmitText(
    _request: BasicSubredditRequest,
    _metadata?: Metadata
  ): Promise<SubmitTextResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubmitText is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditAbout(
    request: BasicSubredditRequest,
    _metadata?: Metadata
  ): Promise<SubredditAboutResponse> {
    const subredditName = request.subreddit;
    let found: SubredditAboutResponse_AboutData | undefined;

    for (const [name, data] of this._subreddits.entries()) {
      if (name.toLowerCase() === subredditName.toLowerCase()) {
        found = data;
        break;
      }
    }

    if (!found) {
      throw new Error('HTTP 404 Not Found');
    }

    return { data: found };
  }

  async SubredditAboutEdit(
    _request: SubredditAboutEditRequest,
    _metadata?: Metadata
  ): Promise<SubredditAboutEditResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubredditAboutEdit is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditAboutRules(
    _request: BasicSubredditRequest,
    _metadata?: Metadata
  ): Promise<SubredditAboutRulesResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubredditAboutRules is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditAboutTraffic(
    _request: BasicSubredditRequest,
    _metadata?: Metadata
  ): Promise<SubredditAboutTrafficResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubredditAboutTraffic is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditAddRemovalReason(
    _request: SubredditAddRemovalReasonRequest,
    _metadata?: Metadata
  ): Promise<SubredditAddRemovalReasonResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubredditAddRemovalReason is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditAutocomplete(
    _request: SubredditAutocompleteRequest,
    _metadata?: Metadata
  ): Promise<SubredditAutocompleteResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubredditAutocomplete is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditGetRemovalReasons(
    _request: SubredditGetRemovalReasonsRequest,
    _metadata?: Metadata
  ): Promise<SubredditGetRemovalReasonsResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubredditGetRemovalReasons is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditPostRequirements(
    _request: BasicSubredditRequest,
    _metadata?: Metadata
  ): Promise<SubredditPostRequirementsResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubredditPostRequirements is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditStylesheet(
    _request: SubredditStylesheetRequest,
    _metadata?: Metadata
  ): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method Subreddits.SubredditStylesheet is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditsMineWhere(_request: BasicWhereRequest, _metadata?: Metadata): Promise<Listing> {
    throw new Error(
      `Reddit API method Subreddits.SubredditsMineWhere is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditsSearch(
    _request: SubredditsSearchRequest,
    _metadata?: Metadata
  ): Promise<SubredditsSearchResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubredditsSearch is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SubredditsWhere(
    _request: BasicWhereRequest,
    _metadata?: Metadata
  ): Promise<SubredditsSearchResponse> {
    throw new Error(
      `Reddit API method Subreddits.SubredditsWhere is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Subscribe(_request: SubscribeRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method Subreddits.Subscribe is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async UploadSrImg(
    _request: UploadSrImgRequest,
    _metadata?: Metadata
  ): Promise<UploadSrImgResponse> {
    throw new Error(
      `Reddit API method Subreddits.UploadSrImg is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async UsersSearch(
    _request: UsersSearchRequest,
    _metadata?: Metadata
  ): Promise<UserSearchResponse> {
    throw new Error(
      `Reddit API method Subreddits.UsersSearch is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async UsersWhere(
    _request: BasicWhereRequest,
    _metadata?: Metadata
  ): Promise<SubredditsSearchResponse> {
    throw new Error(
      `Reddit API method Subreddits.UsersWhere is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  addSubreddit(
    data: Partial<SubredditAboutResponse_AboutData> & { id: T5; displayName: string }
  ): SubredditAboutResponse_AboutData {
    const subreddit: SubredditAboutResponse_AboutData = {
      createdUtc: Math.floor(Date.now() / 1000),
      subscribers: 0,
      activeUserCount: 0,
      over18: false,
      lang: 'en',
      url: `/r/${data.name}/`,
      title: data.displayName,
      description: '',
      subredditType: 'public',
      ...data,
      id: data.id.replace(/^t5_/, ''),
    } as SubredditAboutResponse_AboutData;

    this._subreddits.set(data.displayName, subreddit);

    return subreddit;
  }
}
