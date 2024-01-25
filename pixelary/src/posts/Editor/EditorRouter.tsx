import { Devvit } from '@devvit/public-api';
import { OverviewPage } from './OverviewPage.js';
import { HowToPlayPage } from './HowToPlayPage.js';
import { LeaderboardPage } from '../../components/LeaderboardPage.js';
import { CardDrawPage } from './CardDrawPage.js';
import { EditorPage } from './EditorPage.js';
import { ReviewPage } from './ReviewPage.js';
import { getRandomString } from '../../utils/getRandomString.js';
import Words from '../../data/words.json';
import Settings from '../../settings.json';
import { DailyDrawingRecord } from '../../types/DailyDrawingRecord.js';
import { blankCanvas } from '../../utils/blankCanvas.js';
import { editorPages } from './editorPages.js';
import { LeaderboardEntry } from '../../types/LeaderboardEntry.js';
import { s } from 'vitest/dist/reporters-3OMQDZar.js';

interface EditorRouterProps {
  page: string;
  setPage: (page: editorPages) => void;
  data: number[];
  setData: (data: number[]) => void;
  word: string;
  setWord: (word: string) => void;
  leaderboard: LeaderboardEntry[];
  cardDrawCountdown: number;
  setCardDrawCountdown: (duration: number) => void;
  drawingCountdown: number;
  setDrawingCountdown: (countdown: number) => void;
  currentColor: number;
  setCurrentColor: (color: number) => void;
  dailyDrawings: DailyDrawingRecord[];
  setDailyDrawings: (drawings: DailyDrawingRecord[]) => void;
  userPoints: number;
}

export const EditorRouter = (props: EditorRouterProps): JSX.Element => {
  const {
    page,
    setPage,
    data,
    setData,
    word,
    setWord,
    leaderboard,
    cardDrawCountdown,
    setCardDrawCountdown,
    drawingCountdown,
    setDrawingCountdown,
    currentColor,
    setCurrentColor,
    dailyDrawings,
    setDailyDrawings,
    userPoints,
  } = props;

  function clearData() {
    const randomWord = getRandomString(Words);
    setWord(randomWord.toUpperCase());
    setData(blankCanvas);
    setDrawingCountdown(Settings.drawingDuration);
    setCardDrawCountdown(Settings.cardDrawDuration);
  }

  let currentPage;
  switch (page) {
    case 'default':
      currentPage = (
        <OverviewPage dailyDrawings={dailyDrawings} userPoints={userPoints} setPage={setPage} />
      );
      break;
    case 'leaderboard':
      currentPage = (
        <LeaderboardPage leaderboard={leaderboard} onClose={() => setPage('default')} />
      );
      break;
    case 'how-to-play':
      currentPage = <HowToPlayPage setPage={setPage} />;
      break;
    case 'card-draw':
      currentPage = (
        <CardDrawPage
          word={word}
          setPage={setPage}
          cardDrawCountdown={cardDrawCountdown}
          setCardDrawCountdown={setCardDrawCountdown}
        />
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
          drawingCountdown={drawingCountdown}
          setDrawingCountdown={setDrawingCountdown}
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
        />
      );
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
