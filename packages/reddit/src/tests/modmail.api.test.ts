import type {
  ConversationData,
  ConversationUserData,
  MessageData,
  ModActionData,
} from '@devvit/protos/json/devvit/plugin/redditapi/newmodmail/newmodmail_msg.js';
import { context } from '@devvit/server';
import type { MockInstance } from 'vitest';
import { describe, expect, test, vi } from 'vitest';

import { RedditClient } from '../RedditClient.js';
import { redditApiPlugins } from './utils/redditApiPluginsMock.js';
import { runWithTestContext } from './utils/runWithTestContext.js';
import { userActionsPlugin } from './utils/userActionsPluginMock.js';

vi.mock('../plugin.js', () => {
  return {
    getRedditApiPlugins: () => redditApiPlugins,
    getUserActionsPlugin: () => userActionsPlugin,
  };
});

describe('ModMail API', () => {
  const conversationId = 'fake_conversation_id';
  const redditAPI = new RedditClient();

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

  test('bulkReadConversations()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.BulkReadConversations;
    spyPlugin.mockImplementationOnce(async () => ({
      conversationIds: [conversationId],
    }));

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.bulkReadConversations(
        ['askReddit', 'myAwesomeSubreddit'],
        'filtered'
      );

      expect(result).toEqual([conversationId]);

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          entity: 'askReddit,myAwesomeSubreddit',
          state: 'filtered',
        },
        context.metadata
      );
    });
  });

  describe('getConversations()', () => {
    let spyPlugin: MockInstance;

    beforeEach(() => {
      spyPlugin = redditApiPlugins.NewModmail.GetConversations;
      spyPlugin.mockImplementationOnce(async () => ({
        conversations: {
          [conversationId]: getFakeConversationData(),
        },
        messages: {
          msg_1: getFakeMessageData('msg_1'),
        },
        conversationIds: [conversationId],
        viewerId: 't2_123',
      }));
    });

    test('with subreddits defined', async () => {
      await runWithTestContext(async () => {
        const result = await redditAPI.modMail.getConversations({
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
          context.metadata
        );
      });
    });

    test('with subreddits undefined', async () => {
      await runWithTestContext(async () => {
        const result = await redditAPI.modMail.getConversations({
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
          context.metadata
        );
      });
    });
  });

  test('getConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.GetConversation;

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

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.getConversation({
        conversationId,
        markRead: false,
      });

      expect(result).toMatchSnapshot();

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          conversationId,
          markRead: false,
        },
        context.metadata
      );
    });
  });

  test('getSubreddits()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.Subreddits;

    const subredditId = 'fake_subreddit_id';

    const fakeResponse = { subreddits: { [subredditId]: { id: subredditId, name: 'askReddit' } } };
    spyPlugin.mockImplementationOnce(async () => fakeResponse);

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.getSubreddits();

      expect(result).toEqual({
        [subredditId]: {
          id: subredditId,
          name: 'askReddit',
        },
      });

      expect(spyPlugin).toHaveBeenCalledWith({}, context.metadata);
    });
  });

  describe('createConversation()', () => {
    let spyPlugin: MockInstance;

    beforeEach(() => {
      spyPlugin = redditApiPlugins.NewModmail.CreateConversation;

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
      await runWithTestContext(async () => {
        const result = await redditAPI.modMail.createConversation({
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
          context.metadata
        );
      });
    });

    test('with "to" null', async () => {
      await runWithTestContext(async () => {
        const result = await redditAPI.modMail.createConversation({
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
          context.metadata
        );
      });
    });

    test('with "to" undefined', async () => {
      await runWithTestContext(async () => {
        const result = await redditAPI.modMail.createConversation({
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
          context.metadata
        );
      });
    });
  });

  test('reply()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.CreateConversationMessage;

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      user: getFakeUserData(),
    }));

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.reply({
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
        context.metadata
      );
    });
  });

  test('highlightConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.HighlightConversation;

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
    }));

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.highlightConversation(conversationId);

      expect(result).toMatchSnapshot();

      expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, context.metadata);
    });
  });

  test('unhighlightConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.UnhighlightConversation;

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
    }));

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.unhighlightConversation(conversationId);

      expect(result).toMatchSnapshot();
      expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, context.metadata);
    });
  });

  test('archiveConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.ArchiveConversation;

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
    }));

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.archiveConversation(conversationId);

      expect(result).toMatchSnapshot();
      expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, context.metadata);
    });
  });

  test('unarchiveConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.UnarchiveConversation;

    spyPlugin.mockImplementationOnce(async () => ({
      conversation: getFakeConversationData(),
      messages: {
        msg_1: getFakeMessageData('msg_1'),
      },
      modActions: {
        modaction_1: getFakeModActionData('modaction_1'),
      },
    }));

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.unarchiveConversation(conversationId);

      expect(result).toMatchSnapshot();
      expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, context.metadata);
    });
  });

  test('muteConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.MuteConversation;

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

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.muteConversation({ conversationId, numHours: 72 });

      expect(result).toMatchSnapshot();
      expect(spyPlugin).toHaveBeenCalledWith({ conversationId, numHours: 72 }, context.metadata);
    });
  });

  test('unmuteConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.UnmuteConversation;

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

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.unmuteConversation(conversationId);

      expect(result).toMatchSnapshot();
      expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, context.metadata);
    });
  });

  test('readConversations()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.Read;

    await runWithTestContext(async () => {
      await redditAPI.modMail.readConversations([conversationId, 'qwerty']);

      expect(spyPlugin).toHaveBeenCalledWith(
        { conversationIds: `${conversationId},qwerty` },
        context.metadata
      );
    });
  });

  test('unreadConversations()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.Unread;

    await runWithTestContext(async () => {
      await redditAPI.modMail.unreadConversations([conversationId, 'qwerty']);

      expect(spyPlugin).toHaveBeenCalledWith(
        { conversationIds: `${conversationId},qwerty` },
        context.metadata
      );
    });
  });

  test('approveConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.ApproveConversation;

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

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.approveConversation(conversationId);

      expect(result).toMatchSnapshot();
      expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, context.metadata);
    });
  });

  test('disapproveConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.DisapproveConversation;

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

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.disapproveConversation(conversationId);

      expect(result).toMatchSnapshot();
      expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, context.metadata);
    });
  });

  test('tempBanConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.TempBan;

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

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.tempBanConversation({ conversationId, duration: 42 });

      expect(result).toMatchSnapshot();
      expect(spyPlugin).toHaveBeenCalledWith({ conversationId, duration: 42 }, context.metadata);
    });
  });

  test('unbanConversation()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.Unban;

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

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.unbanConversation(conversationId);

      expect(result).toMatchSnapshot();
      expect(spyPlugin).toHaveBeenCalledWith({ conversationId }, context.metadata);
    });
  });

  test('getUnreadCount()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.UnreadCount;
    spyPlugin.mockImplementationOnce(async () => ({
      archived: 42,
      filtered: 3,
    }));

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.getUnreadCount();

      expect(spyPlugin).toHaveBeenCalledWith({}, context.metadata);

      expect(result).toEqual({ archived: 42, filtered: 3 });
    });
  });

  test('getUserConversations()', async () => {
    const spyPlugin = redditApiPlugins.NewModmail.UserConversations;
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

    await runWithTestContext(async () => {
      const result = await redditAPI.modMail.getUserConversations(conversationId);

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          conversationId,
        },
        context.metadata
      );

      expect(result).toEqual(fakeResponse);
    });
  });
});
