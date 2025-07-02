import {
  type Flair,
  FlairDefinition,
  type GraphQL,
  GraphQLDefinition,
  type LinksAndComments,
  LinksAndCommentsDefinition,
  type Listings,
  ListingsDefinition,
  type Moderation,
  ModerationDefinition,
  type ModNote,
  ModNoteDefinition,
  type NewModmail,
  NewModmailDefinition,
  type PrivateMessages,
  PrivateMessagesDefinition,
  type Subreddits,
  SubredditsDefinition,
  type Users,
  UsersDefinition,
  type Widgets,
  WidgetsDefinition,
  type Wiki,
  WikiDefinition,
} from '@devvit/protos';
import { getDevvitConfig } from '@devvit/server/get-devvit-config.js';

/**
 * @internal
 */
export type RedditApiPluginClient = {
  Flair: Flair;
  GraphQL: GraphQL;
  LinksAndComments: LinksAndComments;
  Listings: Listings;
  ModNote: ModNote;
  Moderation: Moderation;
  NewModmail: NewModmail;
  PrivateMessages: PrivateMessages;
  Subreddits: Subreddits;
  Users: Users;
  Widgets: Widgets;
  Wiki: Wiki;
};

let redditApiPlugin: RedditApiPluginClient | undefined;

/**
 * @internal
 */
export function getRedditApiPlugins(): RedditApiPluginClient {
  if (!redditApiPlugin) {
    redditApiPlugin = {
      Flair: getDevvitConfig().use<Flair>(FlairDefinition),
      GraphQL: getDevvitConfig().use<GraphQL>(GraphQLDefinition),
      LinksAndComments: getDevvitConfig().use<LinksAndComments>(LinksAndCommentsDefinition),
      Listings: getDevvitConfig().use<Listings>(ListingsDefinition),
      ModNote: getDevvitConfig().use<ModNote>(ModNoteDefinition),
      Moderation: getDevvitConfig().use<Moderation>(ModerationDefinition),
      NewModmail: getDevvitConfig().use<NewModmail>(NewModmailDefinition),
      PrivateMessages: getDevvitConfig().use<PrivateMessages>(PrivateMessagesDefinition),
      Subreddits: getDevvitConfig().use<Subreddits>(SubredditsDefinition),
      Users: getDevvitConfig().use<Users>(UsersDefinition),
      Widgets: getDevvitConfig().use<Widgets>(WidgetsDefinition),
      Wiki: getDevvitConfig().use<Wiki>(WikiDefinition),
    };
  }
  return redditApiPlugin;
}
