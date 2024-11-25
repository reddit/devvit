import type { Context } from '@devvit/public-api';
import { Devvit, useAsync } from '@devvit/public-api';

import { LoadingState } from '../components/LoadingState.js';
import { Service } from '../service/Service.js';
import type { Dictionary } from '../types/Dictionary.js';
import type { GameSettings } from '../types/GameSettings.js';
import type {
  CollectionPostData,
  DrawingPostData,
  PinnedPostData,
  PostData,
} from '../types/PostData.js';
import { UserData } from '../types/UserData.js';
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
  const service = new Service(context);

  const { data: username, loading: usernameLoading } = useAsync(
    async () => {
      if (!context.userId) return null; // Return early if no userId
      const cacheKey = 'cache:userId-username';
      const cache = await context.redis.hGet(cacheKey, context.userId);
      if (cache) {
        return cache;
      } else {
        const user = await context.reddit.getUserById(context.userId);
        if (user) {
          await context.redis.hSet(cacheKey, {
            [context.userId]: user.username,
          });
          return user.username;
        }
      }
      return null;
    },
    {
      depends: [],
    }
  );

  const { data: gameSettings, loading: gameSettingsLoading } = useAsync<GameSettings>(async () => {
    return await service.getGameSettings();
  });

  const { data: postData, loading: postDataLoading } = useAsync<
    CollectionPostData | PinnedPostData | DrawingPostData
  >(async () => {
    const postType = await service.getPostType(context.postId!);
    switch (postType) {
      case 'collection':
        return await service.getCollectionPost(context.postId!);
      case 'pinned':
        return await service.getPinnedPost(context.postId!);
      case 'drawing':
      default:
        return await service.getDrawingPost(context.postId!);
    }
  });

  const { data: dictionaries, loading: dictionariesLoading } = useAsync<Dictionary[]>(async () => {
    return await service.getActiveDictionaries();
  });

  const { data: userData, loading: userDataLoading } = useAsync<UserData>(
    async () => {
      return await service.getUser(username!, context.postId!);
    },
    {
      depends: [username],
    }
  );

  if (
    usernameLoading ||
    gameSettings === null ||
    gameSettingsLoading ||
    postData === null ||
    postDataLoading ||
    dictionaries === null ||
    dictionariesLoading ||
    userData === null ||
    userDataLoading
  ) {
    return <LoadingState />;
  }

  const postType = postData.postType;
  const postTypes: Record<string, JSX.Element> = {
    drawing: (
      <DrawingPost
        postData={postData as DrawingPostData}
        username={username}
        gameSettings={gameSettings}
        dictionaries={dictionaries}
        userData={userData}
      />
    ),
    collection: <CollectionPost collection={postData as CollectionPostData} />,
    pinned: (
      <PinnedPost
        postData={postData as PostData}
        userData={userData}
        username={username}
        gameSettings={gameSettings}
        dictionaries={dictionaries}
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
      {postTypes[postType] || (
        <vstack alignment="center middle" grow>
          <text>Error: Unknown post type</text>
        </vstack>
      )}
    </zstack>
  );
};
