import type { Context } from '@devvit/public-api';
import { Devvit, useAsync, useState } from '@devvit/public-api';

import { Tab, Tabs } from '../../components/Tabs.js';
import { Service } from '../../service/Service.js';
import type { PostData } from '../../types/PostData.js';
import type { ScoreBoardEntry } from '../../types/ScoreBoardEntry.js';
import { DrawTab } from './DrawTab.js';
import { GuessTab } from './GuessTab.js';
import { ScoresTab } from './ScoresTab.js';

/*
 * Drawing Post
 *
 * This component handles the tab navigation and renders the correct tab content.
 */

interface DrawingPostProps {
  data: {
    postData: PostData;
    username: string | null;
    activeFlairId: string | undefined;
  };
}

export const DrawingPost = (props: DrawingPostProps, context: Context): JSX.Element => {
  // Tab controller
  const tabs = ['Guess', 'Draw', 'Scores'] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [showTabs, setShowTabs] = useState(true);
  // Hack to force useAsync to refetch when we want
  const [postDataFetchCounter, setPostDataFetchCounter] = useState(0);
  const [drawTabFetchCounter, setDrawTabFetchCounter] = useState(0);
  const [scoresTabFetchCounter, setScoresTabFetchCounter] = useState(0);

  // We lifted state up to here to unblock Pixelary deploys due to
  // https://reddit.atlassian.net/browse/DX-7961

  const service = new Service(context.redis);
  const { data: myDrawings, loading: myDrawingsLoading } = useAsync<PostData[]>(
    async () => {
      return props.data.username ? await service.getMyDrawings(props.data.username) : [];
    },
    {
      depends: [props.data.username, drawTabFetchCounter],
    }
  );

  const { data: scoreBoardData, loading: scoreBoardDataLoading } = useAsync<{
    scores: ScoreBoardEntry[];
    scoreBoardUser: {
      rank: number;
      score: number;
    };
  }>(
    async () => {
      const service = new Service(context.redis);
      try {
        const [scoreBoardUser, scores] = await Promise.all([
          service.getScoreBoardUserEntry(props.data.username),
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
    },
    {
      depends: [props.data.username, scoresTabFetchCounter],
    }
  );

  // Pull latest data from the server
  const { data: postData } = useAsync<PostData>(
    async () => {
      try {
        return service.parsePostData(
          await service.getPostData(props.data.postData.postId),
          props.data.username
        );
      } catch (error) {
        console.error('Error loading latest post data', error);
        return props.data.postData;
      }
    },
    {
      depends: [props.data.postData, postDataFetchCounter],
    }
  );

  const latestData = { ...props.data, postData: postData ?? props.data.postData };

  // Tab content map
  const tabContentMap: Record<string, JSX.Element> = {
    Guess: (
      <GuessTab
        {...props}
        data={latestData}
        onDraw={() => {
          setDrawTabFetchCounter((x) => x + 1);
          setTab('Draw');
        }}
        onScores={() => {
          setScoresTabFetchCounter((x) => x + 1);
          setTab('Scores');
        }}
        onCorrectGuess={() => setPostDataFetchCounter((x) => x + 1)}
      />
    ),
    Draw: (
      <DrawTab
        {...props}
        data={latestData}
        onDrawingSubmitted={() => {
          setDrawTabFetchCounter((x) => x + 1);
        }}
        setShowTabs={setShowTabs}
        myDrawings={myDrawings}
        myDrawingsLoading={myDrawingsLoading}
      />
    ),
    Scores: (
      <ScoresTab
        {...props}
        data={latestData}
        scoreBoardData={scoreBoardData}
        scoreBoardDataLoading={scoreBoardDataLoading}
      />
    ),
  };

  return (
    <vstack width="100%" height="100%" alignment="center">
      {/* Tabs */}
      {showTabs && (
        <Tabs>
          {tabs.map((label) => (
            <Tab
              label={label}
              isActive={tab === label}
              onPress={() => {
                if (label === 'Draw') {
                  setDrawTabFetchCounter((x) => x + 1);
                } else if (label === 'Scores') {
                  setScoresTabFetchCounter((x) => x + 1);
                } else if (label === 'Guess') {
                  setPostDataFetchCounter((x) => x + 1);
                }

                setTab(label);
              }}
            />
          ))}
        </Tabs>
      )}

      {/* Tab content */}
      {tabContentMap[tab] || (
        <GuessTab
          {...props}
          data={latestData}
          onDraw={() => {
            setDrawTabFetchCounter((x) => x + 1);
            setTab('Draw');
          }}
          onScores={() => {
            setScoresTabFetchCounter((x) => x + 1);
            setTab('Scores');
          }}
          onCorrectGuess={() => setPostDataFetchCounter((x) => x + 1)}
        />
      )}
    </vstack>
  );
};
