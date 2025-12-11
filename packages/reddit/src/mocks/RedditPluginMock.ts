import { NewModmailDefinition } from '@devvit/protos';
import { FlairDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/flair/flair_svc.js';
import { GraphQLDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/graphql/graphql_svc.js';
import { LinksAndCommentsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/linksandcomments/linksandcomments_svc.js';
import { ListingsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/listings/listings_svc.js';
import { ModerationDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/moderation/moderation_svc.js';
import { ModNoteDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/modnote/modnote_svc.js';
import { PrivateMessagesDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/privatemessages/privatemessages_svc.js';
import { SubredditsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/subreddits/subreddits_svc.js';
import { UsersDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/users/users_svc.js';
import { WidgetsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/widgets/widgets_svc.js';
import { WikiDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/wiki/wiki_svc.js';

import { GraphQLMock } from './GraphQLMock.js';
import { LinksAndCommentsMock } from './LinksAndCommentsMock.js';
import { SubredditMock } from './SubredditMock.js';
import { UserMock } from './UserMock.js';

/**
 * RedditPluginMock serves as the registry for all Reddit backend plugin mocks.
 *
 * It acts as the "Server" side of the mock infrastructure. When the `RedditClient` (client-side)
 * makes an RPC call (e.g. `reddit.getPostById()`), it eventually routes to a plugin method on the backend.
 *
 * This class intercepts those plugin requests.
 *
 * - If a mock implementation exists (e.g. `Users`), it routes the request to that mock.
 * - If no implementation exists (e.g. `Subreddits`), it returns a proxy that throws a helpful error
 *   when any method is called, informing the user that the specific plugin is not yet mocked.
 *
 * This "partial implementation" strategy allows us to incrementally add support for more Reddit APIs
 * without breaking the entire harness or requiring a full implementation of every Reddit service upfront.
 */
export class RedditPluginMock {
  // Mock instances
  readonly users: UserMock;
  readonly linksAndComments: LinksAndCommentsMock;
  readonly subreddits: SubredditMock;
  readonly graphQL: GraphQLMock;
  readonly flair: unknown;
  readonly listings: unknown;
  readonly moderation: unknown;
  readonly modNote: unknown;
  readonly newModmail: unknown;
  readonly privateMessages: unknown;
  readonly widgets: unknown;
  readonly wiki: unknown;

  constructor() {
    this.users = new UserMock();
    this.linksAndComments = new LinksAndCommentsMock();
    this.subreddits = new SubredditMock();
    this.graphQL = new GraphQLMock(this.linksAndComments);
    this.flair = this._createUnimplementedPluginService('Flair');
    this.listings = this._createUnimplementedPluginService('Listings');
    this.moderation = this._createUnimplementedPluginService('Moderation');
    this.modNote = this._createUnimplementedPluginService('ModNote');
    this.newModmail = this._createUnimplementedPluginService('NewModmail');
    this.privateMessages = this._createUnimplementedPluginService('PrivateMessages');
    this.widgets = this._createUnimplementedPluginService('Widgets');
    this.wiki = this._createUnimplementedPluginService('Wiki');

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        // 1. Check if we have a concrete implementation for this plugin (e.g. "Users")
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }

        // 2. Fallback: Return a "Dummy Service" for plugins we haven't implemented yet.
        // Accessing properties on this dummy service is fine, but calling methods will throw.
        return new Proxy(
          {},
          {
            get: () => () => {
              throw new Error(
                `Reddit API plugin ${String(prop)} is not implemented in the test harness.\n` +
                  `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
              );
            },
          }
        );
      },
    });
  }

  /**
   * Returns all registered plugin mocks keyed by their proto service names. You should likely
   * never need to use this method, for internal use only!
   */
  getPluginRegistrations() {
    return {
      [FlairDefinition.fullName]: this.flair,
      [GraphQLDefinition.fullName]: this.graphQL.plugin,
      [LinksAndCommentsDefinition.fullName]: this.linksAndComments.plugin,
      [ListingsDefinition.fullName]: this.listings,
      [ModerationDefinition.fullName]: this.moderation,
      [ModNoteDefinition.fullName]: this.modNote,
      [NewModmailDefinition.fullName]: this.newModmail,
      [PrivateMessagesDefinition.fullName]: this.privateMessages,
      [SubredditsDefinition.fullName]: this.subreddits.plugin,
      [UsersDefinition.fullName]: this.users.plugin,
      [WidgetsDefinition.fullName]: this.widgets,
      [WikiDefinition.fullName]: this.wiki,
    };
  }

  private _createUnimplementedPluginService(pluginName: string) {
    return new Proxy(
      {},
      {
        get: () => () => {
          throw new Error(
            `Reddit API plugin ${pluginName} is not implemented in the test harness.\n` +
              `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
          );
        },
      }
    );
  }
}
