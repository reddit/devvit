import type { FormKey } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { OverviewPage } from './OverviewPage.js';
import { HowToPlayPage } from './HowToPlayPage.js';
import { LeaderboardPage } from '../../components/LeaderboardPage.js';
import { CardDrawPage } from './CardDrawPage.js';
import { EditorPage } from './EditorPage.js';
import { ReviewPage } from './ReviewPage.js';
import type { PostData } from '../../types/PostData.js';
import type { editorPages } from './editorPages.js';
import type { ScoreBoardEntry } from '../../types/ScoreBoardEntry.js';
import type { GameSettings } from '../../types/GameSettings.js';

interface EditorRouterProps {
  page: string;
  setPage: (page: editorPages) => void;
  data: number[];
  setData: (data: number[]) => void;
  word: string;
  scores: ScoreBoardEntry[];
  cardDrawTimeLeft: number;
  setCardDrawTimer: () => void;
  cancelDrawingTimer: () => void;
  drawingTimeLeft: number;
  fallbackTimerUpdate: () => void;
  currentColor: number;
  setCurrentColor: (color: number) => void;
  dailyDrawings: PostData[];
  setDailyDrawings: (drawings: PostData[]) => void;
  userPoints: number;
  cancelConfirmationForm: FormKey;
  clearData: () => void;
  currentSubreddit: string;
  username: string | null;
  gameSettings: GameSettings;
}

export const EditorRouter = (props: EditorRouterProps): JSX.Element => {
  const {
    page,
    setPage,
    data,
    setData,
    word,
    scores,
    cardDrawTimeLeft,
    drawingTimeLeft,
    cancelDrawingTimer,
    fallbackTimerUpdate,
    currentColor,
    setCurrentColor,
    dailyDrawings,
    setDailyDrawings,
    userPoints,
    setCardDrawTimer,
    cancelConfirmationForm,
    clearData,
    currentSubreddit,
    username,
    gameSettings,
  } = props;

  const overviewPage = (
    <OverviewPage
      dailyDrawings={dailyDrawings}
      userPoints={userPoints}
      setPage={setPage}
      startCardDrawTimer={setCardDrawTimer}
    />
  );

  let currentPage;
  switch (page) {
    case 'default':
      currentPage = overviewPage;
      break;
    case 'leaderboard':
      currentPage = <LeaderboardPage scores={scores} onClose={() => setPage('default')} />;
      break;
    case 'how-to-play':
      currentPage = <HowToPlayPage setPage={setPage} />;
      break;
    case 'card-draw':
      currentPage = (
        <CardDrawPage word={word} setPage={setPage} cardDrawCountdown={cardDrawTimeLeft} />
      );
      break;
    case 'editor':
      currentPage = (
        <EditorPage
          word={word}
          data={data}
          setData={setData}
          setPage={setPage}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          drawingCountdown={drawingTimeLeft}
          cancelDrawingTimer={cancelDrawingTimer}
          fallbackTimerUpdate={fallbackTimerUpdate}
        />
      );
      break;
    case 'review':
      currentPage = (
        <ReviewPage
          data={data}
          word={word}
          clearData={clearData}
          setPage={setPage}
          dailyDrawings={dailyDrawings}
          setDailyDrawings={setDailyDrawings}
          cancelConfirmationForm={cancelConfirmationForm}
          currentSubreddit={currentSubreddit}
          username={username}
          gameSettings={gameSettings}
        />
      );
      break;
    default:
      currentPage = overviewPage;
      break;
  }

  return (
    <zstack width="100%" height="100%" alignment="top start">
      <image
        imageHeight={1024}
        imageWidth={1500}
        height="100%"
        width="100%"
        url="background.png"
        description="striped blue background"
        resizeMode="cover"
      />
      {currentPage}
    </zstack>
  );
};
