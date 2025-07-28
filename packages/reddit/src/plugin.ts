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
import { type UserActions, UserActionsDefinition } from '@devvit/protos';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

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
let userActionsPlugin: UserActions | undefined;

/**
 * @internal
 */
export function getRedditApiPlugins(): RedditApiPluginClient {
  return (redditApiPlugin ??= {
    Flair: getDevvitConfig().use(FlairDefinition),
    GraphQL: getDevvitConfig().use(GraphQLDefinition),
    LinksAndComments: getDevvitConfig().use(LinksAndCommentsDefinition),
    Listings: getDevvitConfig().use(ListingsDefinition),
    ModNote: getDevvitConfig().use(ModNoteDefinition),
    Moderation: getDevvitConfig().use(ModerationDefinition),
    NewModmail: getDevvitConfig().use(NewModmailDefinition),
    PrivateMessages: getDevvitConfig().use(PrivateMessagesDefinition),
    Subreddits: getDevvitConfig().use(SubredditsDefinition),
    Users: getDevvitConfig().use(UsersDefinition),
    Widgets: getDevvitConfig().use(WidgetsDefinition),
    Wiki: getDevvitConfig().use(WikiDefinition),
  });
}

/**
 * @internal
 */
export function getUserActionsPlugin(): UserActions {
  return (userActionsPlugin ??= getDevvitConfig().use(UserActionsDefinition)!);
}
