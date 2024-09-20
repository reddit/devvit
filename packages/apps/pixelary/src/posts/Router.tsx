import type { Context } from '@devvit/public-api';
import { Devvit, useInterval, useState } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import type { GameSettings } from '../types/GameSettings.js';
import type { PostData } from '../types/PostData.js';
import type { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';
import { DrawingPost } from './DrawingPost/DrawingPost.js';

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
  const service = new Service(context);
  const [data] = useState<InitialData>(async () => {
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

  const getScoreboard = async (): Promise<{
    scores: ScoreBoardEntry[];
    scoreBoardUser: {
      rank: number;
      score: number;
    };
  }> => {
    try {
      const [scoreBoardUser, scores] = await Promise.all([
        service.getScoreBoardUserEntry(data.username),
        // Keep in sync with rowCount in ScoresTab.tsx
        service.getScoreBoard(10),
      ]);

      return {
        scores: Array.isArray(scores) ? scores : [],
        scoreBoardUser: scoreBoardUser || { rank: 0, score: 0 },
      };
    } catch (error) {
      return {
        scores: [],
        scoreBoardUser: {
          rank: 0,
          score: 0,
        },
      };
    }
  };

  const getPostData = async (): Promise<PostData> => {
    try {
      return service.parsePostData(await service.getPostData(data.postData.postId), data.username);
    } catch (error) {
      console.error('Error loading latest post data', error);
      return data.postData;
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getData = async () => {
    return Promise.all([
      data.username ? await service.getMyDrawings(data.username) : [],
      getScoreboard(),
      getPostData(),
    ]);
  };

  const [[myDrawings, scoreBoardData, postData], setData] =
    useState<Awaited<ReturnType<typeof getData>>>(getData);

  const refetchInterval = useInterval(async () => {
    refetchInterval.stop();
    setData(await getData());
  }, 100);

  const refetch = (): void => {
    refetchInterval.start();
  };

  // Todo: Add the post type to the post data model
  const postType = 'drawing';
  const postTypes: Record<string, JSX.Element> = {
    drawing: (
      <DrawingPost
        data={{
          postData: postData ?? data.postData,
          username: data.username,
          activeFlairId: data.gameSettings.activeFlairId,
        }}
        myDrawings={myDrawings}
        scoreBoardData={scoreBoardData}
        refetch={refetch}
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
