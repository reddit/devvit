import type { Metadata } from '@devvit/protos';
import { describe, expect, test, vi } from 'vitest';
import { Devvit } from '../../../devvit/Devvit.js';
import type { RedditAPIClient } from '../RedditAPIClient.js';
import { createTestRedditApiClient } from './utils/createTestRedditApiClient.js';
import { PostCollection, CollectionDisplayLayout } from '../models/PostCollection.js';

describe('Collection API', () => {
  let api: { reddit: RedditAPIClient; metadata: Metadata };

  beforeAll(() => {
    api = createTestRedditApiClient();
  });

  const createdAtUtc = new Date();
  const lastUpdateUtc = new Date();

  const mockCreateCollectionResponse = {
    collectionId: 'collection_id',
    subredditId: 'sub_id',
    title: 'title',
    authorId: 'author_id',
    authorName: 'author_name',
    createdAtUtc,
    lastUpdateUtc,
    linkIds: [],
  };

  describe('RedditAPIClient:Collection', () => {
    test('createCollection()', async () => {
      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.PostCollections, 'Create');
      spyPlugin.mockImplementationOnce(async () => mockCreateCollectionResponse);

      const collection = await api.reddit.createCollection({
        title: 'title',
        subredditId: 'sub_id',
        description: 'description',
        displayLayout: CollectionDisplayLayout.Gallery,
      });

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          title: 'title',
          srFullname: 'sub_id',
          description: 'description',
          displayLayout: CollectionDisplayLayout.Gallery,
        },
        api.metadata
      );

      const expected = new PostCollection(mockCreateCollectionResponse, api.metadata);

      expect(collection).toEqual(expected);
    });

    test('addPost()', async () => {
      const collection = new PostCollection(mockCreateCollectionResponse, api.metadata);

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.PostCollections, 'AddPost');
      spyPlugin.mockImplementationOnce(async () => ({}));

      await collection.addPost('t3_asdf');

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          collectionId: collection.id,
          linkFullname: 't3_asdf',
        },
        api.metadata
      );
    });

    test('removePost()', async () => {
      const collection = new PostCollection(mockCreateCollectionResponse, api.metadata);

      const spyPlugin = vi.spyOn(Devvit.redditAPIPlugins.PostCollections, 'RemovePost');
      spyPlugin.mockImplementationOnce(async () => ({}));

      await collection.removePost('t3_asdf');

      expect(spyPlugin).toHaveBeenCalledWith(
        {
          collectionId: collection.id,
          linkFullname: 't3_asdf',
        },
        api.metadata
      );
    });
  });
});
