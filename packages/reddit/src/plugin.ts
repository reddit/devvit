// eslint-disable-next-line no-restricted-imports
import {
  type Flair,
  FlairDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/flair/flair_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type GraphQL,
  GraphQLDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/graphql/graphql_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type LinksAndComments,
  LinksAndCommentsDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/linksandcomments/linksandcomments_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type Listings,
  ListingsDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/listings/listings_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type Moderation,
  ModerationDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/moderation/moderation_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type ModNote,
  ModNoteDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/modnote/modnote_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type NewModmail,
  NewModmailDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/newmodmail/newmodmail_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type PrivateMessages,
  PrivateMessagesDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/privatemessages/privatemessages_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type Subreddits,
  SubredditsDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/subreddits/subreddits_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type Users,
  UsersDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/users/users_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type Widgets,
  WidgetsDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/widgets/widgets_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type Wiki,
  WikiDefinition,
} from '@devvit/protos/types/devvit/plugin/redditapi/wiki/wiki_svc.js';
// eslint-disable-next-line no-restricted-imports
import {
  type UserActions,
  UserActionsDefinition,
} from '@devvit/protos/types/devvit/plugin/useractions/useractions.js';
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

/**
 * @internal
 */
export function getRedditApiPlugins(): RedditApiPluginClient {
  return {
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
  };
}

/**
 * @internal
 */
export function getUserActionsPlugin(): UserActions {
  if (!getDevvitConfig().uses(UserActionsDefinition)) {
    throw new Error(
      `UserActions plugin is not enabled. To use 'runAs: "USER"', set 'permissions.reddit.asUser: [ "PERMISSION_SCOPE_NAME" ]' in your devvit.json file.`
    );
  }
  return getDevvitConfig().use(UserActionsDefinition)!;
}
