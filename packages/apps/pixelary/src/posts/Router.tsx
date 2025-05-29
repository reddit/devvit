import type { Context } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import type {
  CollectionPostData,
  Dictionary,
  DrawingPostData,
  GameSettings,
  PinnedPostData,
  PostData,
  PostId,
  UserData,
} from '../types.js';
import { PostType } from '../types.js';
import { CollectionPost } from './CollectionPost/CollectionPost.js';
import { DrawingPost } from './DrawingPost/DrawingPost.js';
import { PinnedPost } from './PinnedPost/PinnedPost.js';

/*
 * Page Router
 *
 * This is the post type router and the main entry point for the custom post.
 * It handles the initial data loading and routing to the correct page based on the post type.
 */

export const Router: Devvit.CustomPostComponent = (context: Context) => {
  const postId = context.postId as PostId;
  const service = new Service(context);

  const getUsername = async () => {
    if (!context.userId) return null; // Return early if no userId

    const cacheKey = `cache:userId-username:${context.userId}`;
    let cache = await context.redis.get(cacheKey);
    if (cache) {
      return cache;
    }

    const cacheTtlMs = 30 * 86_400; // 30 days
    const expiration = new Date(Date.now() + cacheTtlMs);

    const oldCacheKey = 'cache:userId-username';
    cache = await context.redis.hGet(oldCacheKey, context.userId);
    if (cache) {
      // Forward to the current cache.
      await context.redis.set(cacheKey, cache, { expiration });
      return cache;
    }

    const user = await context.reddit.getUserById(context.userId);
    if (user) {
      await context.redis.set(cacheKey, user.username, { expiration });
      return user.username;
    }
    return null;
  };

  function getPostData(
    postType: PostType,
    postId: PostId
  ): Promise<DrawingPostData | CollectionPostData | PinnedPostData> {
    switch (postType) {
      case PostType.COLLECTION:
        return service.getCollectionPost(postId);
      case PostType.PINNED:
        return service.getPinnedPost(postId);
      case PostType.DRAWING:
      default:
        return service.getDrawingPost(postId);
    }
  }

  const [data] = useState<{
    gameSettings: GameSettings;
    postData: DrawingPostData | CollectionPostData | PinnedPostData;
    postType: PostType;
    dictionaries: Dictionary[];
    userData: UserData | null;
    username: string | null;
  }>(async () => {
    // First batch
    const [postType, username] = await Promise.all([service.getPostType(postId), getUsername()]);

    // Second batch
    const [postData, gameSettings, dictionaries, userData] = await Promise.all([
      getPostData(postType, postId),
      service.getGameSettings(),
      service.getActiveDictionaries(),
      service.getUser(username, postId),
    ]);

    return {
      gameSettings,
      postData,
      postType,
      dictionaries,
      userData,
      username,
    };
  });

  const postTypes: Record<string, JSX.Element> = {
    drawing: (
      <DrawingPost
        postData={data.postData as DrawingPostData}
        username={data.username}
        gameSettings={data.gameSettings}
        dictionaries={data.dictionaries}
        userData={data.userData}
      />
    ),
    collection: <CollectionPost collection={data.postData as CollectionPostData} />,
    pinned: (
      <PinnedPost
        postData={data.postData as PostData}
        userData={data.userData}
        username={data.username}
        gameSettings={data.gameSettings}
        dictionaries={data.dictionaries}
      />
    ),
    // Add more post types here
  };

  /*
   * Return the custom post unit
   */

  return (
    <zstack width="100%" height="100%" alignment="top start">
      <image
        imageHeight={1024}
        imageWidth={2048}
        height="100%"
        width="100%"
        url="background.png"
        description="Striped blue background"
        resizeMode="cover"
      />
      {postTypes[data.postType] || (
        <vstack alignment="center middle" grow>
          <text>Error: Unknown post type</text>
        </vstack>
      )}
    </zstack>
  );
};
