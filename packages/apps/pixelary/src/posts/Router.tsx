import type { Context } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';

import Words from '../data/words.json';
import { Service } from '../service/Service.js';
import type { GameSettings } from '../types/GameSettings.js';
import type { CollectionPostData, PinnedPostData, PostData } from '../types/PostData.js';
import { CollectionPost } from './CollectionPost/CollectionPost.js';
import { DrawingPost } from './DrawingPost/DrawingPost.js';
import { PinnedPost } from './PinnedPost/PinnedPost.js';

type InitialData = {
  gameSettings: GameSettings;
  postData: PostData | CollectionPostData | PinnedPostData;
  username: string | null;
  currentDictionary: string[];
};

/*
 * Page Router
 *
 * This is the post type router and the main entry point for the custom post.
 * It handles the initial data loading and routing to the correct page based on the post type.
 */

const defaultSettings: GameSettings = {
  activeFlairId: undefined,
  endedFlairId: undefined,
  heroPostId: undefined,
};

const defaultPostData: PostData = {
  postId: '',
  word: '',
  data: [],
  authorUsername: '',
  date: 0,
  count: {
    guesses: 0,
    players: 0,
    winners: 0,
    words: 0,
    skipped: 0,
  },
  user: {
    guesses: 0,
    points: 0,
    solved: false,
    skipped: false,
  },
  guesses: [],
  postType: 'drawing',
};

const defaultData = {
  gameSettings: defaultSettings,
  postData: defaultPostData,
  username: null,
  currentDictionary: Words,
};

export const Router: Devvit.CustomPostComponent = (context: Context) => {
  const service = new Service(context);
  const [data] = useState<InitialData>(async () => {
    try {
      const [
        gameSettings = defaultSettings,
        rawPostData,
        username = null,
        currentDictionary = Words,
      ] = await Promise.all([
        service.getGameSettings(),
        service.getPostData(context.postId!),
        context.reddit.getCurrentUser().then((user) => user?.username ?? null),
        service.getDictionary(false),
      ]);
      let postData: PostData | CollectionPostData | PinnedPostData;
      if (rawPostData.postType === 'collection') {
        postData = service.parseCollectionPostData(rawPostData);
      } else if (rawPostData.postType === 'pinned') {
        postData = service.parsePinnedPostData(rawPostData);
      } else {
        postData = service.parsePostData(rawPostData, username);
      }
      return {
        gameSettings,
        postData,
        username,
        currentDictionary,
      };
    } catch (error) {
      console.error('Error loading initial data', error);
      return defaultData;
    }
  });

  const postType = data.postData.postType;
  const postTypes: Record<string, JSX.Element> = {
    drawing: (
      <DrawingPost
        data={{
          postData: data.postData as PostData,
          username: data.username,
          activeFlairId: data.gameSettings.activeFlairId,
          currentDictionary: data.currentDictionary,
        }}
      />
    ),
    collection: <CollectionPost collection={data.postData as CollectionPostData} />,
    pinned: (
      <PinnedPost
        data={{
          postData: data.postData as PostData,
          username: data.username,
          activeFlairId: data.gameSettings.activeFlairId,
          currentDictionary: data.currentDictionary,
        }}
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
