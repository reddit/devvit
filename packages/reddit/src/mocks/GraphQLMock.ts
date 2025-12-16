import type {
  PersistedQueryRequest,
  QueryRequest,
  QueryResponse,
} from '@devvit/protos/json/devvit/plugin/redditapi/graphql/graphql_msg.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type { GraphQL } from '@devvit/protos/types/devvit/plugin/redditapi/graphql/graphql_svc.js';
import type { PluginMock } from '@devvit/shared-types/test/index.js';

import type { LinksAndCommentsMock } from './LinksAndCommentsMock.js';

const methodMap: { readonly [method: string]: string } = {
  GetUserSocialLinks: 'User.getSocialLinks',
  GetSnoovatarUrlByName: 'User.getSnoovatarUrl',
  GetVaultContactByAddress: 'getVaultByAddress',
  GetVaultContactByUserId: 'getVaultByUserId',
  CreateModmailConversation: 'ModMailService.create*Conversation',
  GetSubredditInfoByName: 'getSubredditInfoByName',
  GetSubredditInfoById: 'getSubredditInfoById',
  CreateShareUrl: 'createShareUrl',
};

export class GraphQLPluginMock implements GraphQL {
  private readonly _linksAndCommentsMock: LinksAndCommentsMock;

  constructor(linksAndCommentsMock: LinksAndCommentsMock) {
    this._linksAndCommentsMock = linksAndCommentsMock;
  }

  async PersistedQuery(
    request: PersistedQueryRequest,
    _metadata?: Metadata
  ): Promise<QueryResponse> {
    const { operationName, variables } = request;

    if (operationName === 'GetDevvitPostData') {
      const id = variables?.id as string | undefined;
      if (!id) {
        throw new Error('GetDevvitPostData requires an id');
      }
      const postData = this._linksAndCommentsMock.getPostData(id);

      return {
        data: {
          postInfoById: {
            devvit: {
              postData: postData ? JSON.stringify({ developerData: postData }) : undefined,
            },
          },
        },
        errors: [],
      };
    }

    const friendlyName = methodMap[operationName];
    const nameToReport = friendlyName ?? 'unknown';

    throw new Error(
      `Reddit API method ${nameToReport} is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Query(_request: QueryRequest, _metadata?: Metadata): Promise<QueryResponse> {
    throw new Error(
      `Reddit API method GraphQL.Query is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }
}

export class GraphQLMock implements PluginMock<GraphQL> {
  readonly plugin: GraphQLPluginMock;

  constructor(linksAndCommentsMock: LinksAndCommentsMock) {
    this.plugin = new GraphQLPluginMock(linksAndCommentsMock);
  }
}
