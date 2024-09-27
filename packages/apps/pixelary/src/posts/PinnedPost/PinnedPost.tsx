import { Devvit, useState } from '@devvit/public-api';

import type { PostData } from '../../types/PostData.js';
import type { ScoreBoardEntry } from '../../types/ScoreBoardEntry.js';
import { LeaderboardPage } from '../../components/LeaderboardPage.js';
import { StyledButton } from '../../components/StyledButton.js';
import { PixelText } from '../../components/PixelText.js';
import { HowToPlayPage } from '../../components/HowToPlayPage.js';
import { EditorPage } from '../../components/EditorPage.js';
import { MyDrawingsPage } from '../../components/MyDrawingsPage.js';

interface PinnedPostProps {
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

export const PinnedPost = (props: PinnedPostProps): JSX.Element => {
  const [page, setPage] = useState('menu');
  const latestData = { ...props.data };
  const buttonWidth = '256px';
  const buttonHeight = '48px';

  const Menu = (
    <vstack width="100%" height="100%" alignment="center middle">
      <spacer grow />
      {/* Logo */}
      <image
        url={`data:image/svg+xml,
        <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path d="M36 12H40V16H44V20H48V24H52V28H48V32H44V36H40V40H36V44H32V48H28V52H24V56H20V52H16V48H12V44H8V40H12V36H16V32H20V28H24V24H28V20H32V16H36V12Z" fill="#F2C94C"/>
            <path d="M44 4H52V8H56V12H60V20H56V24H52V20H48V16H44V12H40V8H44V4Z" fill="#EB5757"/>
            <path d="M4 44V56H8V60H20V52H16V48H12V44H4Z" fill="#F2994A"/>
            <path d="M44 0H52V4H44V0Z" fill="black"/>
            <path d="M40 8V4H44V8H40Z" fill="black"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M40 12V8H36V12H32V16H28V20H24V24H20V28H16V32H12V36H8V40H4V44H0V64H20V60H24V56H28V52H32V48H36V44H40V40H44V36H48V32H52V28H56V24H60V20H64V12H60V8H56V4H52V8H56V12H60V20H56V24H52V20H48V16H44V12H40ZM40 12V16H44V20H48V24H52V28H48V32H44V36H40V40H36V44H32V48H28V52H24V56H20V60H12V56H8V52H4V44H8V40H12V36H16V32H20V28H24V24H28V20H32V16H36V12H40Z" fill="black"/>
        </svg>`}
        imageHeight={128}
        imageWidth={128}
        width="64px"
        height="64px"
        description="Pixelary Logo"
      />
      <spacer height="16px" />

      {/* Wordmark */}
      <PixelText scale={4}>Pixelary</PixelText>
      <spacer grow />

      {/* Menu */}
      <vstack alignment="center middle" gap="small">
        <StyledButton
          width={buttonWidth}
          appearance="primary"
          height={buttonHeight}
          onPress={() => setPage('draw')}
          leadingIcon="+"
          label="DRAW"
        />
        <StyledButton
          width={buttonWidth}
          appearance="secondary"
          height={buttonHeight}
          onPress={() => setPage('my-drawings')}
          label="MY DRAWINGS"
        />
        <StyledButton
          width={buttonWidth}
          appearance="secondary"
          height={buttonHeight}
          onPress={() => setPage('leaderboard')}
          label="LEADERBOARD"
        />
        <StyledButton
          width={buttonWidth}
          appearance="secondary"
          height={buttonHeight}
          onPress={() => setPage('how-to-play')}
          label="HOW TO PLAY"
        />
      </vstack>
      <spacer grow />
    </vstack>
  );

  const onClose = (): void => {
    setPage('menu');
  };

  const pages: Record<string, JSX.Element> = {
    menu: Menu,
    draw: <EditorPage data={latestData} onCancel={onClose} />,
    'my-drawings': (
      <MyDrawingsPage
        data={latestData}
        myDrawings={props.myDrawings}
        myDrawingsLoading={false}
        onClose={onClose}
        onDraw={() => setPage('draw')}
      />
    ),
    leaderboard: (
      <LeaderboardPage
        data={latestData}
        scoreBoardData={props.scoreBoardData}
        // TODO: Implement loading state
        scoreBoardDataLoading={false}
        onClose={onClose}
      />
    ),
    'how-to-play': <HowToPlayPage onClose={onClose} />,
  };

  return pages[page] || Menu;
};
