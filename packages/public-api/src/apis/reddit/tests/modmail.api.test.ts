import type {
  ConversationData,
  ConversationUserData,
  MessageData,
  Metadata,
  ModActionData,
} from '@devvit/protos';
import type { MockInstance } from 'vitest';
import { describe, expect, test, vi } from 'vitest';

import { Devvit } from '../../../devvit/Devvit.js';
import type { RedditAPIClient } from '../RedditAPIClient.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';

describe('ModMail API', () => {
  let api: { reddit: RedditAPIClient; metadata: Metadata };

  const conversationId = 'fake_conversation_id';

  function getFakeConversationData(): ConversationData {
    return {
      id: conversationId,
      isAuto: true,
      participant: {
        id: 23456765,
        name: 'Jane',
        isMod: true,
        isAdmin: false,
        isOp: true,
        isParticipant: true,
        isApproved: false,
        isHidden: true,
        isDeleted: false,
      },
      objIds: [
        { id: 'msg_1', key: 'messages' },
        { id: 'msg_2', key: 'messages' },
        { id: 'modaction_1', key: 'modActions' },
        { id: 'modaction_2', key: 'modActions' },
      ],
      isRepliable: true,
      lastUserUpdate: '2006-04-25T10:23:35.187153+00:00',
      isInternal: false,
      lastModUpdate: '2006-04-26T10:23:35.187153+00:00',
      authors: [
        {
          id: 654322,
          name: 'John',
          isMod: false,
          isAdmin: true,
          isOp: false,
          isParticipant: false,
          isApproved: true,
          isHidden: false,
          isDeleted: true,
        },
      ],
      lastUpdated: '2006-04-27T10:23:35.187153+00:00',
      legacyFirstMessageId: 'legacyID',
      state: 2,
      conversationType: 'sr_user',
      lastUnread: '2006-04-28T10:23:35.187153+00:00',
      owner: {
        displayName: 'AskReddit',
        type: 'subreddit',
        id: 'sub_42',
      },
      subject: 'Lorem ipsum',
      isHighlighted: true,
      numMessages: 42,
      modActions: {},
    };
  }

  function getFakeMessageData(id: string): MessageData {
    return {
      id,
      body: 'Lorem ipsum sit amet',
      author: { id: 654322, name: 'Bob' },
      isInternal: false,
      date: '2006-04-12T10:23:35.187153+00:00',
      bodyMarkdown: '<div>',
      participatingAs: 'UNKNOWN',
    };
  }

  function getFakeModActionData(id: string): ModActionData {
    return {
      id,
      date: '2006-04-01T10:23:35.187153+00:00',
      actionTypeId: 3,
      author: {
        isMod: true,
        isAdmin: true,
        name: 'fake_mod',
        isHidden: false,
        id: 2323423987,
        isDeleted: false,
      },
    };
  }

  function getFakeUserData(): ConversationUserData {
    return {
      id: 'fakeuser_id',
      name: 'fakeUser',
      muteStatus: { muteCount: 0, isMuted: false },
      created: '',
      banStatus: { isPermanent: false, isBanned: false },
      isSuspended: false,
      approveStatus: { isApproved: true },
      isShadowBanned: false,
      recentComments: {},
      recentPosts: {},
      recentConvos: {},
    };
  }

  beforeAll(() => {
    api = createTestRedditApiClient();
  });

  test('bulkReadConversations()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'BulkReadConversations');
    spyPlugin.mockImplementationOnce(async () => ({
      conversationIds: [conversationId],
    }));

    const result = await api.reddit.modMail.bulkReadConversations(
      ['askReddit', 'myAwesomeSubreddit'],
      'filtered'
    );

    expect(result).toEqual([conversationId]);

    expect(spyPlugin).toHaveBeenCalledWith(
      {
        entity: 'askReddit,myAwesomeSubreddit',
        state: 'filtered',
      },
      api.metadata
    );
  });

  describe('getConversations()', () => {
    let spyPlugin: MockInstance;

    beforeEach(() => {
      spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'GetConversations');
      spyPlugin.mockImplementationOnce(async () => ({
        conversations: {
          [conversationId]: getFakeConversationData(),
        },
        messages: {
          msg_1: getFakeMessageData('msg_1'),
        },
        conversationIds: [conversationId],
        viewerId: 'viewer_fakeId',
      }));
    });

    test('with subreddits defined', async () => {
      const result = await api.reddit.modMail.getConversations({
        after: conversationId,
        subreddits: ['askReddit'],
        limit: 42,
        sort: 'recent',
        state: 'archived',
      });

      expect(result).toMatchSnapshot();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          after: conversationId,
          entity: 'askReddit',
          limit: 42,
          sort: 'recent',
          state: 'archived',
        },
        api.metadata
      );
    });

    test('with subreddits undefined', async () => {
      const result = await api.reddit.modMail.getConversations({
        after: conversationId,
        limit: 42,
        sort: 'recent',
        state: 'archived',
      });

      expect(result).toMatchSnapshot();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          after: conversationId,
          limit: 42,
          sort: 'recent',
          state: 'archived',
        },
        api.metadata
      );
    });
  });

  test('getConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'GetConversation');

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
        msg_2: getFakeMessageData('msg_2'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
        modaction_2: getFakeModActionData('modaction_2'),
      },
      user: getFakeUserData(),
    }));

    const result = await api.reddit.modMail.getConversation({
      conversationId,
      markRead: false,
    });

    expect(result).toMatchSnapshot();

    expect(spyPlugin).toHaveBeenCalledWith(
      {
        conversationId,
        markRead: false,
      },
      api.metadata
    );
  });

  test('getSubreddits()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'Subreddits');

    const subredditId = 'fake_subreddit_id';

    const fakeResponse = { subreddits: { [subredditId]: { id: subredditId, name: 'askReddit' } } };
    spyPlugin.mockImplementationOnce(async () => fakeResponse);

    const result = await api.reddit.modMail.getSubreddits();

    expect(result).toEqual({
      [subredditId]: {
        id: subredditId,
        name: 'askReddit',
      },
    });

    expect(spyPlugin).toHaveBeenCalledWith({}, api.metadata);
  });

  describe('createConversation()', () => {
    let spyPlugin: MockInstance;

    beforeEach(() => {
      spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'CreateConversation');

      spyPlugin.mockImplementationOnce(async () => ({
        conversation: getFakeConversationData(),
        messages: {
          msg_1: getFakeMessageData('msg_1'),
        },
        modActions: {
          modaction_1: getFakeModActionData('modaction_1'),
        },
        user: getFakeUserData(),
      }));
    });

    test('with "to" defined', async () => {
      const result = await api.reddit.modMail.createConversation({
        body: 'This is new conversation 4',
        subredditName: 'playtest_ac_001_priv',
        subject: 'Subject: new conversation',
        to: 'my_username',
      });

      expect(result).toMatchSnapshot();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          body: 'This is new conversation 4',
          isAuthorHidden: false,
          srName: 'playtest_ac_001_priv',
          subject: 'Subject: new conversation',
          to: 'my_username',
        },
        api.metadata
      );
    });

    test('with "to" null', async () => {
      const result = await api.reddit.modMail.createConversation({
        body: 'This is new conversation 4',
        subredditName: 'playtest_ac_001_priv',
        subject: 'Subject: new conversation',
        to: null,
      });

      expect(result).toMatchSnapshot();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          body: 'This is new conversation 4',
          isAuthorHidden: false,
          srName: 'playtest_ac_001_priv',
          subject: 'Subject: new conversation',
          to: undefined,
        },
        api.metadata
      );
    });

    test('with "to" undefined', async () => {
      const result = await api.reddit.modMail.createConversation({
        body: 'This is new conversation 4',
        subredditName: 'playtest_ac_001_priv',
        subject: 'Subject: new conversation',
      });

      expect(result).toMatchSnapshot();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          body: 'This is new conversation 4',
          isAuthorHidden: false,
          srName: 'playtest_ac_001_priv',
          subject: 'Subject: new conversation',
          to: undefined,
        },
        api.metadata
      );
    });
  });

  test('reply()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'CreateConversationMessage');

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      user: getFakeUserData(),
    }));

    const result = await api.reddit.modMail.reply({
      body: 'Lorem ipsum',
      isAuthorHidden: true,
      isInternal: true,
      conversationId,
    });

    expect(result).toMatchSnapshot();

    expect(spyPlugin).toHaveBeenCalledWith(
      {
        body: 'Lorem ipsum',
        conversationId,
        isAuthorHidden: true,
        isInternal: true,
      },
      api.metadata
    );
  });

  test('highlightConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'HighlightConversation');

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
    }));

    const result = await api.reddit.modMail.highlightConversation(conversationId);

    expect(result).toMatchSnapshot();

    expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, api.metadata);
  });

  test('unhighlightConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'UnhighlightConversation');

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
    }));

    const result = await api.reddit.modMail.unhighlightConversation(conversationId);

    expect(result).toMatchSnapshot();
    expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, api.metadata);
  });

  test('archiveConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'ArchiveConversation');

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
    }));

    const result = await api.reddit.modMail.archiveConversation(conversationId);

    expect(result).toMatchSnapshot();
    expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, api.metadata);
  });

  test('unarchiveConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'UnarchiveConversation');

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
    }));

    const result = await api.reddit.modMail.unarchiveConversation(conversationId);

    expect(result).toMatchSnapshot();
    expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, api.metadata);
  });

  test('muteConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'MuteConversation');

    spyPlugin.mockImplementationOnce(async () => ({
      conversations: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
      user: getFakeUserData(),
    }));

    const result = await api.reddit.modMail.muteConversation({ conversationId, numHours: 72 });

    expect(result).toMatchSnapshot();
    expect(spyPlugin).toHaveBeenCalledWith({ conversationId, numHours: 72 }, api.metadata);
  });

  test('unmuteConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'UnmuteConversation');

    spyPlugin.mockImplementationOnce(async () => ({
      conversations: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
      user: getFakeUserData(),
    }));

    const result = await api.reddit.modMail.unmuteConversation(conversationId);

    expect(result).toMatchSnapshot();
    expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, api.metadata);
  });

  test('readConversations()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'Read');

    await api.reddit.modMail.readConversations([conversationId, 'qwerty']);

    expect(spyPlugin).toHaveBeenCalledWith(
      { conversationIds: `${conversationId},qwerty` },
      api.metadata
    );
  });

  test('unreadConversations()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'Unread');

    await api.reddit.modMail.unreadConversations([conversationId, 'qwerty']);

    expect(spyPlugin).toHaveBeenCalledWith(
      { conversationIds: `${conversationId},qwerty` },
      api.metadata
    );
  });

  test('approveConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'ApproveConversation');

    spyPlugin.mockImplementationOnce(async () => ({
      conversations: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
      user: getFakeUserData(),
      fields: [],
    }));

    const result = await api.reddit.modMail.approveConversation(conversationId);

    expect(result).toMatchSnapshot();
    expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, api.metadata);
  });

  test('disapproveConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'DisapproveConversation');

    spyPlugin.mockImplementationOnce(async () => ({
      conversations: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
      user: getFakeUserData(),
      fields: [],
    }));

    const result = await api.reddit.modMail.disapproveConversation(conversationId);

    expect(result).toMatchSnapshot();
    expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, api.metadata);
  });

  test('tempBanConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'TempBan');

    spyPlugin.mockImplementationOnce(async () => ({
      conversations: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
      user: getFakeUserData(),
      fields: [],
    }));

    const result = await api.reddit.modMail.tempBanConversation({ conversationId, duration: 42 });

    expect(result).toMatchSnapshot();
    expect(spyPlugin).toHaveBeenCalledWith({ conversationId, duration: 42 }, api.metadata);
  });

  test('unbanConversation()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'Unban');

    spyPlugin.mockImplementationOnce(async () => ({
      conversations: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
      user: getFakeUserData(),
      fields: [],
    }));

    const result = await api.reddit.modMail.unbanConversation(conversationId);

    expect(result).toMatchSnapshot();
    expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, api.metadata);
  });

  test('getUnreadCount()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'UnreadCount');
    spyPlugin.mockImplementationOnce(async () => ({
      archived: 42,
      filtered: 3,
    }));

    const result = await api.reddit.modMail.getUnreadCount();

    expect(spyPlugin).toHaveBeenCalledWith({}, api.metadata);

    expect(result).toEqual({ archived: 42, filtered: 3 });
  });

  test('getUserConversations()', async () => {
    const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.NewModmail, 'UserConversations');
    const fakeResponse = {
      recentComments: {},
      muteStatus: { muteCount: 1, isMuted: true },
      name: 'test_name',
      created: '2022',
      banStatus: { isBanned: false },
      isSuspended: false,
      approveStatus: { isApproved: true },
      isShadowBanned: false,
      recentPosts: {},
      recentConvos: {},
      id: conversationId,
    };

    spyPlugin.mockImplementationOnce(async () => fakeResponse);

    const result = await api.reddit.modMail.getUserConversations(conversationId);

    expect(spyPlugin).toHaveBeenCalledWith(
      {
        conversationId,
      },
      api.metadata
    );

    expect(result).toEqual(fakeResponse);
  });
});
