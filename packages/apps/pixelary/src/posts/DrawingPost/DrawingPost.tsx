import type { Context } from '@devvit/public-api';
import { Devvit, useState } from '@devvit/public-api';

import { Tab, Tabs } from '../../components/Tabs.js';
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
    currentDictionary: string[];
  };
  myDrawings: PostData[];
  scoreBoardData: {
    scores: ScoreBoardEntry[];
    scoreBoardUser: {
      rank: number;
      score: number;
    };
  };
  refetch: () => void;
}

export const DrawingPost = (props: DrawingPostProps, context: Context): JSX.Element => {
  // Tab controller
  const tabs = ['Guess', 'Draw', 'Scores'] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [showTabs, setShowTabs] = useState(true);

  const latestData = { ...props.data };

  // Tab content map
  const tabContentMap: Record<string, JSX.Element> = {
    Guess: (
      <GuessTab
        {...props}
        data={latestData}
        onDraw={() => {
          props.refetch();
          setTab('Draw');
        }}
        onScores={() => {
          props.refetch();
          setTab('Scores');
        }}
        refresh={() => props.refetch()}
      />
    ),
    Draw: (
      <DrawTab
        {...props}
        data={latestData}
        refresh={() => {
          props.refetch();
        }}
        setShowTabs={setShowTabs}
        myDrawings={props.myDrawings}
        myDrawingsLoading={false}
      />
    ),
    Scores: (
      <ScoresTab
        {...props}
        data={latestData}
        scoreBoardData={props.scoreBoardData}
        scoreBoardDataLoading={false}
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
                props.refetch();
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
            props.refetch();
            setTab('Draw');
          }}
          onScores={() => {
            props.refetch();
            setTab('Scores');
          }}
          refresh={() => props.refetch()}
        />
      )}
    </vstack>
  );
};
