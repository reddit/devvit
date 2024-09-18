import type { Context } from '@devvit/public-api';
import { Devvit, useAsync } from '@devvit/public-api';
import { Service } from '../service/Service.js';
import type { PostData } from '../types/PostData.js';
import type { GameSettings } from '../types/GameSettings.js';
import { DrawingPost } from './DrawingPost/DrawingPost.js';
import { LoadingState } from '../components/LoadingState.js';

type InitialData = {
  gameSettings: GameSettings;
  postData: PostData;
  username: string | null;
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
  },
  user: {
    guesses: 0,
    points: 0,
    solved: false,
  },
  guesses: [],
};

const defaultData = {
  gameSettings: defaultSettings,
  postData: defaultPostData,
  username: null,
};

export const Router: Devvit.CustomPostComponent = (context: Context) => {
  const service = new Service(context.redis);
  const { data, loading } = useAsync<InitialData>(async () => {
    try {
      const [gameSettings = defaultSettings, rawPostData, username = null] = await Promise.all([
        service.getGameSettings(),
        service.getPostData(context.postId!),
        context.reddit.getCurrentUser().then((user) => user?.username ?? null),
      ]);
      const postData = service.parsePostData(rawPostData, username);
      return {
        gameSettings,
        postData,
        username,
      };
    } catch (error) {
      console.error('Error loading initial data', error);
      return defaultData;
    }
  });

  if (loading || !data) {
    return <LoadingState />;
  }

  // Todo: Add the post type to the post data model
  const postType = 'drawing';
  const postTypes: Record<string, JSX.Element> = {
    drawing: (
      <DrawingPost
        data={{
          postData: data.postData,
          username: data.username,
          activeFlairId: data.gameSettings.activeFlairId,
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
        imageWidth={1500}
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
