import { Devvit, useState } from '@devvit/public-api';
import type { PostData } from '../../types/PostData.js';
import { Tabs, Tab } from '../../components/Tabs.js';
import { GuessTab } from './GuessTab.js';
import { DrawTab } from './DrawTab.js';
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
    subredditName: string;
    activeFlairId: string | undefined;
  };
}

export const DrawingPost = (props: DrawingPostProps): JSX.Element => {
  // Tab controller
  const tabs = ['Guess', 'Draw', 'Scores'];
  const [tab, setTab] = useState(tabs[0]);
  const [showTabs, setShowTabs] = useState(true);

  // Tab content map
  const tabContentMap: Record<string, JSX.Element> = {
    Guess: <GuessTab {...props} onDraw={() => setTab('Draw')} onScores={() => setTab('Scores')} />,
    Draw: <DrawTab {...props} setShowTabs={setShowTabs} />,
    Scores: <ScoresTab {...props} />,
  };

  return (
    <vstack width="100%" height="100%" alignment="center">
      {/* Tabs */}
      {showTabs && (
        <Tabs>
          {tabs.map((label) => (
            <Tab label={label} isActive={tab === label} onPress={() => setTab(label)} />
          ))}
        </Tabs>
      )}

      {/* Tab content */}
      {tabContentMap[tab] || (
        <GuessTab {...props} onDraw={() => setTab('Draw')} onScores={() => setTab('Scores')} />
      )}
    </vstack>
  );
};
