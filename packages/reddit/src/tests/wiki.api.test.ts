import { WikiVersion as WikiVersionProto } from '@devvit/protos/json/devvit/plugin/redditapi/wiki/wiki_msg.js';
import { context } from '@devvit/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { WikiPagePermissionLevel } from '../models/WikiPage.js';
import { RedditClient } from '../RedditClient.js';
import { redditApiPlugins } from './utils/redditApiPluginsMock.js';
import { runWithTestContext } from './utils/runWithTestContext.js';

vi.mock('../plugin.js', () => ({
  getRedditApiPlugins: () => redditApiPlugins,
}));

const revisionId = '01234567-89ab-cdef-0123-456789abcdef' as const;

const wikiPageWithAuthorId = {
  contentMd: 'wiki content',
  contentHtml: '<p>wiki content</p>',
  revisionId,
  revisionDate: 0,
  mayRevise: true,
  revisionBy: {
    data: {
      id: 't2_wiki_author',
    },
  },
};

const wikiPageWithAuthor = {
  ...wikiPageWithAuthorId,
  revisionBy: {
    data: {
      id: 't2_wiki_author',
      name: 'wiki_author',
      createdUtc: 0,
      snoovatarSize: [],
    },
  },
};

const wikiPageSettingsWithEditorId = {
  listed: true,
  permLevel: WikiPagePermissionLevel.SUBREDDIT_PERMISSIONS,
  editors: [
    {
      data: {
        id: 't2_wiki_editor',
      },
    },
  ],
};

describe('Wiki API', () => {
  const reddit = new RedditClient();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('supports the V2 getWikiPage options overload', async () => {
    const isVersionEnabled = redditApiPlugins.Wiki.IsWikiVersionEnabledInSubreddit;
    const getWikiPage = redditApiPlugins.Wiki.GetWikiPage;
    isVersionEnabled.mockResolvedValue({ enabled: true });
    getWikiPage
      .mockResolvedValueOnce({ kind: 'wikipage', data: wikiPageWithAuthorId })
      .mockResolvedValueOnce({ kind: 'wikipage', data: wikiPageWithAuthor });

    await runWithTestContext(async () => {
      await expect(reddit.isWikiV2Enabled('test_subreddit')).resolves.toBe(true);

      const v2Page = await reddit.getWikiPage('test_subreddit', 'index', {
        revisionId,
        wikiVersion: 'v2',
      });
      const v1Page = await reddit.getWikiPage('test_subreddit', 'index', revisionId);

      expect(isVersionEnabled).toHaveBeenCalledWith(
        {
          subreddit: 'test_subreddit',
          wikiVersion: WikiVersionProto.WIKI_VERSION_V2,
        },
        context.metadata
      );
      expect(getWikiPage).toHaveBeenNthCalledWith(
        1,
        {
          subreddit: 'test_subreddit',
          page: 'index',
          revisionId,
          wikiVersion: WikiVersionProto.WIKI_VERSION_V2,
        },
        context.metadata
      );
      expect(getWikiPage).toHaveBeenNthCalledWith(
        2,
        {
          subreddit: 'test_subreddit',
          page: 'index',
          revisionId,
          wikiVersion: WikiVersionProto.WIKI_VERSION_V1,
        },
        context.metadata
      );
      expect(v2Page.revisionAuthorId).toBe('t2_wiki_author');
      expect(v2Page.revisionAuthor).toBeUndefined();
      expect(v1Page.revisionAuthor?.id).toBe('t2_wiki_author');
    });
  });

  test('passes V2 to all remaining exposed wiki methods', async () => {
    const getWikiPages = redditApiPlugins.Wiki.GetWikiPages;
    const editWikiPage = redditApiPlugins.Wiki.EditWikiPage;
    const getWikiPage = redditApiPlugins.Wiki.GetWikiPage;
    const getWikiPageRevisions = redditApiPlugins.Wiki.GetWikiPageRevisions;
    const revertWikiPage = redditApiPlugins.Wiki.RevertWikiPage;
    const getWikiPageSettings = redditApiPlugins.Wiki.GetWikiPageSettings;
    const updateWikiPageSettings = redditApiPlugins.Wiki.UpdateWikiPageSettings;
    const allowEditor = redditApiPlugins.Wiki.AllowEditor;
    getWikiPages.mockResolvedValue({ kind: 'wikipagelisting', data: [] });
    editWikiPage.mockResolvedValue({});
    getWikiPage.mockResolvedValue({ kind: 'wikipage', data: wikiPageWithAuthorId });
    getWikiPageRevisions.mockResolvedValue({
      kind: 'Listing',
      data: {
        children: [
          {
            id: revisionId,
            page: 'index',
            timestamp: 0,
            reason: '',
            revisionHidden: false,
            author: {
              data: {
                id: 't2_wiki_author',
              },
            },
          },
        ],
      },
    });
    revertWikiPage.mockResolvedValue({});
    getWikiPageSettings.mockResolvedValue({
      kind: 'wikipagesettings',
      data: wikiPageSettingsWithEditorId,
    });
    updateWikiPageSettings.mockResolvedValue({
      kind: 'wikipagesettings',
      data: wikiPageSettingsWithEditorId,
    });
    allowEditor.mockResolvedValue({});

    await runWithTestContext(async () => {
      await reddit.getWikiPages('test_subreddit', { wikiVersion: 'v2' });
      await reddit.updateWikiPage({
        subredditName: 'test_subreddit',
        page: 'index',
        content: 'wiki content',
        wikiVersion: 'v2',
      });
      const revisions = await reddit
        .getWikiPageRevisions({
          subredditName: 'test_subreddit',
          page: 'index',
          wikiVersion: 'v2',
        })
        .get(1);
      await reddit.revertWikiPage('test_subreddit', 'index', revisionId, { wikiVersion: 'v2' });
      const settings = await reddit.getWikiPageSettings('test_subreddit', 'index', {
        wikiVersion: 'v2',
      });
      await reddit.updateWikiPageSettings({
        subredditName: 'test_subreddit',
        page: 'index',
        listed: true,
        permLevel: WikiPagePermissionLevel.SUBREDDIT_PERMISSIONS,
        wikiVersion: 'v2',
      });
      await reddit.addEditorToWikiPage('test_subreddit', 'index', 'wiki_editor', {
        wikiVersion: 'v2',
      });
      await reddit.removeEditorFromWikiPage('test_subreddit', 'index', 'wiki_editor', {
        wikiVersion: 'v2',
      });

      expect(getWikiPages).toHaveBeenCalledWith(
        expect.objectContaining({ wikiVersion: WikiVersionProto.WIKI_VERSION_V2 }),
        context.metadata
      );
      expect(editWikiPage).toHaveBeenCalledWith(
        expect.objectContaining({ wikiVersion: WikiVersionProto.WIKI_VERSION_V2 }),
        context.metadata
      );
      expect(getWikiPage).toHaveBeenCalledWith(
        expect.objectContaining({ wikiVersion: WikiVersionProto.WIKI_VERSION_V2 }),
        context.metadata
      );
      expect(getWikiPageRevisions).toHaveBeenCalledWith(
        expect.objectContaining({ wikiVersion: WikiVersionProto.WIKI_VERSION_V2 }),
        context.metadata
      );
      expect(revisions[0]?.authorId).toBe('t2_wiki_author');
      expect(revisions[0]?.author).toBeUndefined();
      expect(revertWikiPage).toHaveBeenCalledWith(
        expect.objectContaining({ wikiVersion: WikiVersionProto.WIKI_VERSION_V2 }),
        context.metadata
      );
      expect(settings.editorIds).toEqual(['t2_wiki_editor']);
      expect(settings.editors).toEqual([]);
      expect(getWikiPageSettings).toHaveBeenCalledWith(
        expect.objectContaining({ wikiVersion: WikiVersionProto.WIKI_VERSION_V2 }),
        context.metadata
      );
      expect(updateWikiPageSettings).toHaveBeenCalledWith(
        expect.objectContaining({ wikiVersion: WikiVersionProto.WIKI_VERSION_V2 }),
        context.metadata
      );
      expect(allowEditor).toHaveBeenCalledTimes(2);
      expect(allowEditor).toHaveBeenCalledWith(
        expect.objectContaining({ wikiVersion: WikiVersionProto.WIKI_VERSION_V2 }),
        context.metadata
      );
    });
  });
});
