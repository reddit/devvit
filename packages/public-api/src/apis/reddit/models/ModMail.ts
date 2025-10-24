import {
  type ConversationData as ProtosConversationData,
  type MessageData as ProtosMessageData,
  type Metadata,
  type ModActionData as ProtosModActionData,
} from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';

import { Devvit } from '../../../devvit/Devvit.js';
import { asT5ID, type T5ID } from '../../../types/tid.js';
import { GraphQL } from '../graphql/GraphQL.js';

export type SubredditData = {
  id?: string;
  name?: string;
  displayName?: string;
  communityIcon?: string;
  keyColor?: string;
  subscribers?: number;
  primaryColor?: string;
  lastUpdated?: string;
  icon?: string;
};

export type GetConversationsRequest = {
  /** modmail conversation id */
  after?: string;
  /** array of subreddit names */
  subreddits?: string[];
  /** an integer between 1 and 100 (default: 25) */
  limit?: number;
  /**
   * Sort by:
   * - `recent` - Order by whenever anyone last updated the conversation, mod or participant
   * - `mod` - Order by the last time a mod updated the conversation
   * - `user` - Order by the last time a participant user updated the conversation
   * - `unread` - Order by the most recent unread message in the conversation for this mod
   */
  sort?: 'recent' | 'mod' | 'user' | 'unread';
  /**
   * Filter by conversation state
   *
   * A conversation can be in more than one state.
   * For example, a conversation may be both 'highlighted' and 'inprogress'.
   */
  state?: ConversationStateFilter;
};

/**
 * A Conversation State is a way in which conversations may be filtered within the UI.
 *
 * A conversation can be in more than one state.
 * For example, a conversation may be both 'highlighted' and 'inprogress'.
 */
export type ConversationStateFilter =
  | 'all'
  | 'new'
  | 'inprogress'
  | 'archived'
  | 'appeals'
  | 'join_requests'
  | 'highlighted'
  | 'mod'
  | 'notifications'
  | 'inbox'
  | 'filtered'
  | 'default';

/**
 * Conversation participant
 */
export type Participant = {
  isMod?: boolean;
  isAdmin?: boolean;
  name?: string;
  isOp?: boolean;
  isParticipant?: boolean;
  isApproved?: boolean;
  isHidden?: boolean;
  id?: number;
  isDeleted?: boolean;
};

export type ConversationUserData = {
  /** User ID*/
  id?: string;
  /** Username */
  name?: string;
  /** Recent comments */
  recentComments: {
    [id: string]: {
      comment?: string;
      date?: string;
      permalink?: string;
      title?: string;
    };
  };
  /** Recent posts */
  recentPosts: {
    [id: string]: {
      date?: string;
      permalink?: string;
      title?: string;
    };
  };
  /** Recent conversations */
  recentConvos: {
    [id: string]: {
      date?: string;
      permalink?: string;
      id?: string;
      subject?: string;
    };
  };
  isSuspended?: boolean;
  isShadowBanned?: boolean;
  muteStatus?: { isMuted?: boolean; muteCount?: number; endDate?: string; reason?: string };
  banStatus?: { isBanned?: boolean; isPermanent?: boolean; endDate?: string; reason?: string };
  approveStatus?: { isApproved?: boolean };
  /** When was created */
  created?: string;
};

export enum ModMailConversationState {
  New = 'New',
  InProgress = 'InProgress',
  Archived = 'Archived',
  Appeals = 'Appeals',
  JoinRequests = 'JoinRequests',
  Filtered = 'Filtered',
}

const R2_TO_MODMAIL_CONVERSATION_STATE: { [key: number]: ModMailConversationState } = {
  0: ModMailConversationState.New,
  1: ModMailConversationState.InProgress,
  2: ModMailConversationState.Archived,
  3: ModMailConversationState.Appeals,
  4: ModMailConversationState.JoinRequests,
  5: ModMailConversationState.Filtered,
};

/**
 * An ActionType describes a particular logged action within a conversation. For example,
 * if a mod highlights a conversation, a ModerationAction record with the type `Highlighted`
 * would be created.
 */
export enum ModMailActionType {
  Highlighted = 'Highlighted',
  Unhighlighted = 'Unhighlighted',
  Archived = 'Archived',
  Unarchived = 'Unarchived',
  ReportedToAdmins = 'ReportedToAdmins',
  Muted = 'Muted',
  Unmuted = 'Unmuted',
  Banned = 'Banned',
  Unbanned = 'Unbanned',
  Approved = 'Approved',
  Disapproved = 'Disapproved',
  Filtered = 'Filtered',
  Unfiltered = 'Unfiltered',
}

const R2_TO_MOD_ACTION_TYPE: { [key: number]: ModMailActionType } = {
  0: ModMailActionType.Highlighted,
  1: ModMailActionType.Unhighlighted,
  2: ModMailActionType.Archived,
  3: ModMailActionType.Unarchived,
  4: ModMailActionType.ReportedToAdmins,
  5: ModMailActionType.Muted,
  6: ModMailActionType.Unmuted,
  7: ModMailActionType.Banned,
  8: ModMailActionType.Unbanned,
  9: ModMailActionType.Approved,
  10: ModMailActionType.Disapproved,
  11: ModMailActionType.Filtered,
  12: ModMailActionType.Unfiltered,
};

export type ConversationData = {
  /** Conversation ID */
  id?: string;
  /** Suject of the conversation */
  subject?: string;
  /**
   * Subreddit owning the modmail conversation
   */
  subreddit?: {
    displayName?: string;
    id?: string;
  };
  /**
   * A ConversationType specifies whether a conversation is with a subreddit
   * itself, with another user, or with another subreddit entirely.
   * - `sr_user` - This is a conversation with another user outside of the subreddit. The participant ID is that user's ID.
   * - `internal` - This is a Mod Discussion, internal to the subreddit. There is no other participant.
   * - `sr_sr` - This is a conversation is with another subreddit. The participant will have a subreddit ID.
   */
  conversationType?: string;
  /** Is the conversation automatically generated e.g. from automod, u/reddit */
  isAuto?: boolean;
  /** Participant. Is absent for mod discussions */
  participant?: Participant;
  /** The last datetime a user made any interaction with the conversation */
  lastUserUpdate?: string;
  /** Is the conversation internal (i.e. mod only) */
  isInternal?: boolean;
  /**
   * The last datetime a mod from the owning subreddit made any interaction
   * with the conversation.
   *
   * (Note that if this is a subreddit to subreddit conversation, the mods of
   * the participant subreddit are irrelevant and do not affect this field.)
   */
  lastModUpdate?: string;
  /** The authors of each message in the modmail conversation. */
  authors: Participant[];
  /** The datetime of the last time the conversation was update. */
  lastUpdated?: string;
  /** State of the conversation */
  state?: ModMailConversationState;
  /** The datetime of the last unread message within this conversation for the current viewer. */
  lastUnread?: string;
  /** Is the conversation highlighted */
  isHighlighted?: boolean;
  /** Number of messages (not actions) in the conversation */
  numMessages?: number;
  /**
   * Conversation messages
   *
   * @example
   * ```ts
   * const arrayOfMessages = Object.values(conversation.messages);
   * const messageById = conversation.messages[messageId];
   * ```
   */
  messages: { [id: string]: MessageData };
  /**
   * Conversation mod actions
   *
   * @example
   * ```ts
   * const arrayOfModActions = Object.values(conversation.modActions);
   * const modActionById = conversation.modActions[modActionId];
   * ```
   */
  modActions: { [id: string]: ModActionData };
};

export type ModActionData = {
  /** Action id */
  id?: string;
  /** Type of the action */
  actionType: ModMailActionType;
  /** When the action happened */
  date?: string;
  /** Action author */
  author?: {
    /** User id  */
    id?: number;
    /** User name */
    name?: string;
    isMod?: boolean;
    isAdmin?: boolean;
    isHidden?: boolean;
    isDeleted?: boolean;
  };
};

export type MessageData = {
  /** Message ID */
  id?: string;
  /** Message body */
  body?: string;
  /** When was created */
  date?: string;
  author?: Participant;
  isInternal?: boolean;
  bodyMarkdown?: string;
  participatingAs?: string;
};

export type ConversationResponse = {
  conversation: ConversationData;
};

export type WithUserData = {
  user?: ConversationUserData;
};

export type UnreadCountResponse = {
  archived?: number;
  appeals?: number;
  highlighted?: number;
  notifications?: number;
  joinRequests?: number;
  filtered?: number;
  new?: number;
  inprogress?: number;
  mod?: number;
};

type ParticipantSubreddit = {
  id: string;
  name: string;
};

export type GetConversationResponse = {
  conversation?: ConversationData;
  /** If the conversation is with another subreddit, what subreddit we are communicating with. */
  participantSubreddit?: ParticipantSubreddit;
} & WithUserData;

export type GetConversationsResponse = {
  /**
   * Conversations key-value map
   */
  conversations: { [id: string]: ConversationData };
  viewerId?: string;
  /**
   * Array of conversation ids, ordered by the sort parameter specified in {@link GetConversationsRequest}.
   */
  conversationIds: string[];
};

/**
 * Class providing the methods for working with Mod Mail
 */
export class ModMailService {
  readonly #metadata: Metadata;
  readonly notificationSubjectPrefix = '[notification]';

  /**
   * @internal
   */
  constructor(metadata: Metadata) {
    this.#metadata = metadata;
  }

  /**
   * Marks all conversations read for a particular conversation state within the passed list of subreddits.
   *
   * @param subreddits Array of subreddit names
   * @param state One of the possible conversation states ('all' to read all conversations)
   *
   * @returns conversationIds
   *
   * @example
   * ```ts
   * const conversationIds = await reddit.modMail.bulkReadConversations(
   *   ['askReddit', 'myAwesomeSubreddit'],
   *   'filtered'
   * );
   * ```
   */
  async bulkReadConversations(
    subreddits: string[],
    state: ConversationStateFilter
  ): Promise<string[]> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const { conversationIds } = await client.BulkReadConversations(
      {
        entity: subreddits.join(','),
        state,
      },
      this.#metadata
    );

    return conversationIds;
  }

  /**
   * Get conversations for a logged in user or subreddits
   *
   * @param params.after id of a modmail
   * @param params.subreddits array of subreddit names
   * @param params.limit an integer between 1 and 100 (default: 25)
   * @param params.sort one of (recent, mod, user, unread)
   * @param params.state One of the possible conversation states ('all' to read all conversations)
   *
   * @example
   * ```ts
   * const {viewerId, conversations} = await reddit.modMail.getConversations({
   *   after: 'abcdef',
   *   limit: 42
   * });
   *
   * const arrayOfConversations = Object.values(conversations);
   * ```
   */
  async getConversations(params: GetConversationsRequest): Promise<GetConversationsResponse> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.GetConversations(
      {
        after: params.after,
        entity: params.subreddits ? params.subreddits.join(',') : undefined,
        limit: params.limit,
        sort: params.sort,
        state: params.state,
      },
      this.#metadata
    );

    const conversations: { [id: string]: ConversationData } = {};

    for (const id in response.conversations) {
      conversations[id] = this.#transformConversationData({
        protoConversation: response.conversations[id],
        protoMessages: response.messages,
        protoModActions: {},
      });
    }

    return {
      conversations,
      viewerId: response.viewerId,
      conversationIds: response.conversationIds,
    };
  }

  /**
   * Returns all messages, mod actions and conversation metadata for a given conversation id
   *
   * @param params.conversationId id of a modmail conversation
   * @param params.markRead should be marked as read (default: false)
   *
   * @example
   * ```ts
   * const { conversation, messages, modActions, user } = await reddit.modMail.getConversation({ conversationId: 'abcdef', markRead: true });
   * ```
   */
  async getConversation(params: {
    /** a modmail conversation id */
    conversationId: string;
    /** mark read? */
    markRead?: boolean;
  }): Promise<GetConversationResponse> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.GetConversation(
      { ...params, markRead: !!params.markRead },
      this.#metadata
    );

    return {
      participantSubreddit: response.participantSubreddit as ParticipantSubreddit | undefined,
      conversation: this.#transformConversationData({
        protoConversation: response.conversation!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
      user: response.user,
    };
  }

  /**
   * Returns a list of Subreddits that the user moderates with mail permission
   *
   * @example
   * ```ts
   * const subredditsData = await reddit.modMail.getSubreddits();
   *
   * for (const subreddit of Object.values(subreddits)) {
   *   console.log(subreddit.id);
   *   console.log(subreddit.name);
   * }
   * ```
   */
  async getSubreddits(): Promise<{ [key: string]: SubredditData }> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const { subreddits } = await client.Subreddits({}, this.#metadata);

    return subreddits;
  }

  /**
   * Creates a new conversation for a particular SR.
   *
   * This endpoint will create a ModmailConversation object
   * as well as the first ModmailMessage within the ModmailConversation object.
   *
   * @note
   * Note on {param.to}:
   * The to field for this endpoint is somewhat confusing. It can be:
   * - A User, passed like "username" or "u/username"
   * - A Subreddit, passed like "r/subreddit"
   * - null, meaning an internal moderator discussion
   *
   * In this way to is a bit of a misnomer in modmail conversations.
   * What it really means is the participant of the conversation who is not a mod of the subreddit.
   *
   * If you plan to send a message to the app-account or a moderator of the subreddit, use {@link ModMailService.createModDiscussionConversation}, {@link ModMailService.createModInboxConversation}, or {@link ModMailService.createModNotification} instead.
   * Otherwise, messages sent to the app-account or moderator will automatically be routed to Mod Discussions.
   * @param params.body markdown text
   * @param params.isAuthorHidden is author hidden? (default: false)
   * @param params.subredditName subreddit name
   * @param params.subject subject of the conversation. max 100 characters
   * @param params.to a user (e.g. u/username), a subreddit (e.g. r/subreddit) or null
   *
   * @example
   * ```ts
   * const { conversation, messages, modActions } = await reddit.modMail.createConversation({
   *   subredditName: 'askReddit',
   *   subject: 'Test conversation',
   *   body: 'Lorem ipsum sit amet',
   *   to: null,
   * });
   * ```
   */
  async createConversation(params: {
    body: string;
    isAuthorHidden?: boolean;
    subredditName: string;
    subject: string;
    to?: string | null;
  }): Promise<ConversationResponse & WithUserData> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.CreateConversation(
      {
        body: params.body,
        isAuthorHidden: params.isAuthorHidden ?? false,
        srName: params.subredditName,
        subject: params.subject,
        to: params.to ? params.to : undefined,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversation!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
      user: response.user,
    };
  }

  /**
   * Creates a conversation in Mod Discussions with the moderators of the given subredditId.
   *
   * Note: The app must be installed in the subreddit in order to create a conversation in Mod Discussions.
   *
   * @param subject - The subject of the message.
   * @param bodyMarkdown - The body of the message in markdown format, e.g. `Hello world \n\n **Have a great day**`.
   * @param subredditId - The ID (starting with `t5_`) of the subreddit to which to send the message, e.g. `t5_2qjpg`.
   * @returns A Promise that resolves a string representing the conversationId of the message.
   * @example
   * ```ts
   * const conversationId = await reddit.modMail.createModDiscussionConversation({
   *   subject: 'Test conversation',
   *   bodyMarkdown: '**Hello there** \n\n _Have a great day!_',
   *   subredditId: context.subredditId
   * });
   * ```
   */
  async createModDiscussionConversation(params: {
    subject: string;
    bodyMarkdown: string;
    subredditId: string;
  }): Promise<string> {
    return createModmailConversation(
      {
        subject: params.subject,
        bodyMarkdown: params.bodyMarkdown,
        subredditId: asT5ID(params.subredditId),
        isInternal: true,
        participantType: 'MODERATOR',
        conversationType: 'INTERNAL',
      },
      this.#metadata
    );
  }

  /**
   * Creates a conversation in the Modmail Inbox with the moderators of the given subredditId.
   *
   * @param subject - The subject of the message.
   * @param bodyMarkdown - The body of the message in markdown format, e.g. `Hello world \n\n **Have a great day**`.
   * @param subredditId - The ID (starting with `t5_`) of the subreddit to which to send the message, e.g. `t5_2qjpg`.
   * @returns A Promise that resolves a string representing the conversationId of the message.
   * @example
   * ```ts
   * const conversationId = await reddit.modMail.createModInboxConversation({
   *   subject: 'Test conversation',
   *   bodyMarkdown: '**Hello there** \n\n _Have a great day!_',
   *   subredditId: context.subredditId
   * });
   * ```
   */
  async createModInboxConversation(params: {
    subject: string;
    bodyMarkdown: string;
    subredditId: string;
  }): Promise<string> {
    return createModmailConversation(
      {
        subject: params.subject,
        bodyMarkdown: params.bodyMarkdown,
        subredditId: asT5ID(params.subredditId),
        isInternal: false,
        participantType: 'PARTICIPANT_USER',
        conversationType: 'SR_USER',
      },
      this.#metadata
    );
  }

  /**
   * Creates a notification in the Modmail Inbox.
   * This function is different from {@link ModMailService.createModInboxConversation} in that the conversation also appears in the "Notifications" section of Modmail.
   *
   * @param subject - The subject of the message.
   * @param bodyMarkdown - The body of the message in markdown format, e.g. `Hello world \n\n **Have a great day**`.
   * @param subredditId - The ID (starting with `t5_`) of the subreddit to which to send the message, e.g. `t5_2qjpg`.
   * @returns A Promise that resolves a string representing the conversationId of the message.
   * @example
   * ```ts
   * const conversationId = await reddit.modMail.createModNotification({
   *   subject: 'Test notification',
   *   bodyMarkdown: '**Hello there** \n\n _This is a notification!_',
   *   subredditId: context.subredditId
   * });
   * ```
   */
  async createModNotification(params: {
    subject: string;
    bodyMarkdown: string;
    subredditId: string;
  }): Promise<string> {
    let notificationSubject = params.subject;

    if (!params.subject.startsWith(this.notificationSubjectPrefix)) {
      notificationSubject = `${this.notificationSubjectPrefix} ${params.subject}`;
    }

    return createModmailConversation(
      {
        subject: notificationSubject,
        bodyMarkdown: params.bodyMarkdown,
        subredditId: asT5ID(params.subredditId),
        isInternal: false,
        participantType: 'PARTICIPANT_USER',
        conversationType: 'SR_USER',
      },
      this.#metadata
    );
  }

  /**
   * Creates a new message for a particular conversation.
   *
   * @param params.conversationId Id of a modmail conversation
   * @param params.body markdown text
   * @param params.isInternal is internal message? (default: false)
   * @param params.isAuthorHidden is author hidden? (default: false)
   *
   * @example
   * ```ts
   * await reddit.modMail.reply({
   *   body: 'Lorem ipsum sit amet',
   *   conversationId: 'abcdef',
   * });
   * ```
   */
  async reply(params: {
    body: string;
    isAuthorHidden?: boolean;
    isInternal?: boolean;
    conversationId: string;
  }): Promise<ConversationResponse & WithUserData> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.CreateConversationMessage(
      {
        body: params.body,
        conversationId: params.conversationId,
        isAuthorHidden: params.isAuthorHidden ?? false,
        isInternal: params.isInternal ?? false,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversation!,
        protoMessages: response.messages,
        protoModActions: {},
      }),
      user: response.user,
    };
  }

  /**
   * Marks a conversation as highlighted.
   *
   * @param conversationId Id of a modmail conversation
   *
   * @example
   * ```ts
   * await reddit.modMail.highlightConversation('abcdef');
   * ```
   */
  async highlightConversation(conversationId: string): Promise<ConversationResponse> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.HighlightConversation(
      {
        conversationId: conversationId,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversation!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
    };
  }

  /**
   * Removes a highlight from a conversation.
   *
   * @param conversationId Id of a modmail conversation
   *
   * @example
   * ```ts
   * await reddit.modMail.unhighlightConversation('abcdef');
   * ```
   */
  async unhighlightConversation(conversationId: string): Promise<ConversationResponse> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.UnhighlightConversation(
      {
        conversationId: conversationId,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversation!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
    };
  }

  /**
   * Marks a conversation as archived
   *
   * @param conversationId Id of a modmail conversation
   *
   * @example
   * ```ts
   * await reddit.modMail.archive('abcdef');
   * ```
   */
  async archiveConversation(conversationId: string): Promise<ConversationResponse> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.ArchiveConversation(
      {
        conversationId: conversationId,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversation!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
    };
  }

  /**
   * Marks conversation as unarchived.
   *
   * @param conversationId Id of a modmail conversation
   *
   * @example
   * ```ts
   * await reddit.modMail.unarchiveConversation('abcdef');
   * ```
   */
  async unarchiveConversation(conversationId: string): Promise<ConversationResponse> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.UnarchiveConversation(
      {
        conversationId: conversationId,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversation!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
    };
  }

  /**
   * Marks a conversation as read for the user.
   *
   * @param params.conversationId Id of a modmail conversation
   * @param params.numHours For how many hours the conversation needs to be muted. Must be one of 72, 168, or 672 hours
   *
   * @example
   * ```ts
   * await reddit.modMail.muteConversation({ conversationId: 'abcdef', numHours: 72 });
   * ```
   */
  async muteConversation(params: {
    conversationId: string;
    numHours: 72 | 168 | 672;
  }): Promise<ConversationResponse & WithUserData> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.MuteConversation(
      {
        conversationId: params.conversationId,
        numHours: params.numHours,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversations!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
      user: response.user,
    };
  }

  /**
   * Unmutes the non mod user associated with a particular conversation.
   *
   * @param conversationId Id of a modmail conversation
   *
   * @example
   * ```ts
   * await reddit.modMail.unmuteConversation('abcdef');
   * ```
   */
  async unmuteConversation(conversationId: string): Promise<ConversationResponse & WithUserData> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.UnmuteConversation(
      {
        conversationId,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversations!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
      user: response.user,
    };
  }

  /**
   * Marks a conversations as read for the user.
   *
   * @param conversationIds An array of ids
   *
   * @example
   * ```ts
   * await reddit.modMail.readConversations(['abcdef', 'qwerty']);
   * ```
   */
  async readConversations(conversationIds: string[]): Promise<void> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    await client.Read(
      {
        conversationIds: conversationIds.join(','),
      },
      this.#metadata
    );
  }

  /**
   * Marks conversations as unread for the user.
   *
   * @param conversationIds An array of ids
   *
   * @example
   * ```ts
   * await reddit.modMail.unreadConversations(['abcdef', 'qwerty']);
   * ```
   */
  async unreadConversations(conversationIds: string[]): Promise<void> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    await client.Unread(
      {
        conversationIds: conversationIds.join(','),
      },
      this.#metadata
    );
  }

  /**
   * Approve the non mod user associated with a particular conversation.
   *
   * @param conversationId Id of a modmail conversation
   *
   * @example
   * ```ts
   * await reddit.modMail.approveConversation('abcdef');
   * ```
   */
  async approveConversation(conversationId: string): Promise<ConversationResponse & WithUserData> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.ApproveConversation(
      {
        conversationId,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversations!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
      user: response.user,
    };
  }

  /**
   * Disapprove the non mod user associated with a particular conversation.
   *
   * @param conversationId Id of a modmail conversation
   *
   * @example
   * ```ts
   * await reddit.modMail.disapproveConversation('abcdef');
   * ```
   */
  async disapproveConversation(
    conversationId: string
  ): Promise<ConversationResponse & WithUserData> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.DisapproveConversation(
      {
        conversationId,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversations!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
      user: response.user,
    };
  }

  /**
   * Temporary ban (switch from permanent to temporary ban) the non mod user associated with a particular conversation.
   *
   * @param params.conversationId a modmail conversation id
   * @param params.duration duration in days, max 999
   *
   * @example
   * ```ts
   * await reddit.modMail.tempBanConversation({ conversationId: 'abcdef', duration: 42 });
   * ```
   */
  async tempBanConversation(params: {
    conversationId: string;
    duration: number;
  }): Promise<ConversationResponse & WithUserData> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.TempBan(
      {
        ...params,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversations!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
      user: response.user,
    };
  }

  /**
   * Unban the non mod user associated with a particular conversation.
   *
   * @param conversationId a modmail conversation id
   *
   * @example
   * ```ts
   * await reddit.modMail.unbanConversation('abcdef');
   * ```
   */
  async unbanConversation(conversationId: string): Promise<ConversationResponse & WithUserData> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    const response = await client.Unban(
      {
        conversationId,
      },
      this.#metadata
    );

    return {
      conversation: this.#transformConversationData({
        protoConversation: response.conversations!,
        protoMessages: response.messages,
        protoModActions: response.modActions,
      }),
      user: response.user,
    };
  }

  /**
   * Endpoint to retrieve the unread conversation count by conversation state.
   *
   * @example
   * ```ts
   * const response = await reddit.modMail.getUnreadCount();
   *
   * console.log(response.highlighted);
   * console.log(response.new);
   * ```
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    return await client.UnreadCount({}, this.#metadata);
  }

  /**
   * Returns recent posts, comments and modmail conversations for a given user.
   *
   * @param conversationId Id of a modmail conversation
   *
   * @example
   * ```ts
   * const data = await reddit.modMail.getUserConversations('abcdef');
   *
   * console.log(data.recentComments);
   * console.log(data.recentPosts);
   * ```
   */
  async getUserConversations(conversationId: string): Promise<ConversationUserData> {
    const client = Devvit.redditAPIPlugins.NewModmail;

    return await client.UserConversations({ conversationId }, this.#metadata);
  }

  #transformConversationData({
    protoConversation,
    protoMessages,
    protoModActions,
  }: {
    protoConversation: ProtosConversationData;
    protoMessages: { [id: string]: ProtosMessageData };
    protoModActions: { [id: string]: ProtosModActionData };
  }): ConversationData {
    return {
      ...protoConversation,
      state: R2_TO_MODMAIL_CONVERSATION_STATE[protoConversation.state!],
      messages: this.#getConversationMessages(protoConversation, protoMessages),
      modActions: this.#getConversationModActions(protoConversation, protoModActions),
    };
  }

  #getConversationMessages(
    protoConversation: ProtosConversationData,
    protoMessages: { [id: string]: ProtosMessageData }
  ): { [id: string]: MessageData } {
    const messages: { [id: string]: MessageData } = {};
    const messageIds = protoConversation.objIds
      .filter((o) => o.key === 'messages')
      .map(({ id }) => id!);

    for (const messageId of messageIds) {
      const protoMessage = protoMessages[messageId];
      if (protoMessage) {
        messages[messageId] = protoMessage;
      }
    }

    return messages;
  }

  #getConversationModActions(
    protoConversation: ProtosConversationData,
    protoModActions: { [id: string]: ProtosModActionData }
  ): { [id: string]: ModActionData } {
    const modActions: { [id: string]: ModActionData } = {};
    const modActionIds = protoConversation.objIds
      .filter((o) => o.key === 'modActions')
      .map(({ id }) => id!);

    for (const modActionId of modActionIds) {
      const protoModAction = protoModActions[modActionId];
      if (protoModAction) {
        modActions[modActionId] = {
          ...protoModAction,
          actionType: R2_TO_MOD_ACTION_TYPE[protoModAction.actionTypeId!],
        };
      }
    }

    return modActions;
  }
}

/**
 * Creates a Modmail conversation with the moderators of the given subredditId.
 * @internal
 * @param subject - The subject of the message.
 * @param bodyMarkdown - The body of the message in markdown format, e.g. `Hello world \n\n **Have a great day**`.
 * @param subredditId - The ID (starting with `t5_`) of the subreddit to which to send the message, e.g. `t5_2qjpg`.
 * @param isInternal - Indicates if the conversation should be internal or not.
 * @param participantType - The type of participant the author is in the conversation.
 * @param conversationType - The type of conversation to create.
 * @returns A Promise that resolves a string representing the conversationId of the message.
 */
async function createModmailConversation(
  params: {
    subject: string;
    bodyMarkdown: string;
    subredditId: T5ID;
    isInternal: boolean;
    participantType: string;
    conversationType: string;
  },
  metadata: Metadata
): Promise<string> {
  const appUserId = metadata[Header.AppUser]?.values[0];

  const operationName = 'CreateModmailConversation';
  const persistedQueryHash = '5f9ae20b0c7bdffcafb80241728a72e67cd4239bc09f67284b79d4aa706ee0e5';
  const response = await GraphQL.query(
    operationName,
    persistedQueryHash,
    {
      subject: params.subject,
      bodyMarkdown: params.bodyMarkdown,
      subredditId: params.subredditId,
      authorId: appUserId,
      isInternal: params.isInternal,
      participantType: params.participantType,
      conversationType: params.conversationType,
    },
    metadata
  );

  if (response.data?.createModmailConversationV2?.ok) {
    return response.data?.createModmailConversationV2?.conversationId;
  }
  throw new Error(
    'modmail conversation creation failed; ${response.data?.createModmailConversationV2?.errors[0].message}'
  );
}
