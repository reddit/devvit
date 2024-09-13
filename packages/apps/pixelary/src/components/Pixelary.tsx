import type { Context } from '@devvit/public-api';
import { Devvit, useAsync, useInterval, useState } from '@devvit/public-api';
import { Service } from '../service/Service.js';
import Settings from '../settings.json';
import { getRandomString } from '../utils/getRandomString.js';
import Words from '../data/words.json';
import { blankCanvas } from '../utils/blankCanvas.js';
import type { Page } from '../types/Page.js';
import { getScoreMultiplier } from '../utils/getScoreMultiplier.js';
import type { PostData } from '../types/PostData.js';
import { PixelText } from '../components/PixelText.js';
import type { GameSettings } from '../types/GameSettings.js';
import type { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';
import { CardDrawPage } from '../components/CardDrawPage.js';
import { EditorPage } from '../components/EditorPage.js';
import { InfoPage } from '../components/InfoPage.js';
import { LeaderboardPage } from '../components/LeaderboardPage.js';
import { OverviewPage } from '../components/OverviewPage.js';
import { ReviewPage } from '../components/ReviewPage.js';
import { ViewerPage } from '../components/ViewerPage.js';
import { LoadingState } from './LoadingState.js';

type InitialData = {
  gameSettings: GameSettings;
  postData: PostData;
  scores: ScoreBoardEntry[];
};

export const Pixelary: Devvit.CustomPostComponent = (context: Context) => {
  if (!context.postId) {
    throw new Error('No post id found in context');
  }

  const { redis, postId, reddit } = context;
  const service = new Service(redis);

  const getUsername = (): Promise<null | string> => {
    if (!context.userId) {
      return Promise.resolve(null);
    }
    return reddit
      .getCurrentUser()
      .then((user) => user?.username ?? null)
      .catch(() => null);
  };

  const { data: metadata, loading: metadataLoading } = useAsync<{
    subreddit: string;
    username: string | null;
  }>(async () => {
    const values = await Promise.all([
      // Workaround for a P0 android bug. Remove after next release hits >80%
      // For some reason on the subreddit feed page, the subreddit ID was not
      // being passed down correctly. This is a workaround to help android
      // render more often.
      (async () => 'Pixelary')(),
      // reddit.getCurrentSubreddit().then((sub) => sub.name),
      getUsername(),
    ]);

    return {
      subreddit: values[0],
      username: values[1],
    };
  });
  const maxLength = 8;

  const { data: gameData, loading: gamesDataLoading } = useAsync<InitialData>(
    async () => {
      const defaultSettings: GameSettings = {
        activeFlairId: undefined,
        endedFlairId: undefined,
        heroPostId: undefined,
      };

      const defaultPostData: PostData = {
        word: 'loading',
        data: [],
        authorUsername: 'loading',
        date: 0,
        published: false,
      };
      const defaultData = {
        gameSettings: defaultSettings,
        postData: defaultPostData,
        scores: [],
      };

      try {
        const [gameSettings = defaultSettings, postData = defaultPostData, scores = []] =
          await Promise.all([
            service.getGameSettings(),
            service.getPostData(postId, metadata?.username ?? null),
            service.getScoreBoard(maxLength),
          ]);

        return {
          gameSettings,
          postData,
          scores,
        };
      } catch (error) {
        console.error('Error loading initial data:', error);

        return defaultData;
      }
    },
    {
      depends: metadata,
    }
  );

  const { data: dailyDrawingsRemote, loading: dailyDrawingsRemoteLoading } = useAsync<PostData[]>(
    async () => {
      return metadata?.username ? await service.getDailyDrawings(metadata.username) : [];
    },
    {
      depends: metadata,
    }
  );

  if (
    metadataLoading ||
    !metadata ||
    dailyDrawingsRemoteLoading ||
    !dailyDrawingsRemote ||
    gamesDataLoading ||
    !gameData
  ) {
    return <LoadingState />;
  }

  /*
   * Page Router
   *
   * Default to a viewer page if the post is not the hero post.
   * If the post is the hero post, default to the overview page.
   * Can be extended to include more page types in the future.
   */

  const isHero = gameData?.gameSettings?.heroPostId === postId;

  /*
   * Return the custom post unit
   */

  return (
    <Router
      initialPage={isHero ? 'overview' : 'viewer'}
      dailyDrawingsRemote={dailyDrawingsRemote}
      gameData={gameData}
      metadata={metadata}
    />
  );
};

const PageContainer: Devvit.BlockComponent = ({ children }) => {
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
      {children!}
    </zstack>
  );
};

const Router: Devvit.BlockComponent<{
  initialPage: Page;
  gameData: InitialData;
  dailyDrawingsRemote: PostData[];
  metadata: {
    subreddit: string;
    username: string | null;
  };
}> = ({ gameData, dailyDrawingsRemote, metadata, initialPage }, { redis, reddit, postId }) => {
  const [page, setPage] = useState<Page>(initialPage);
  const service = new Service(redis);

  const [dailyDrawingsLocal, setDailyDrawingsLocal] = useState<PostData[]>([]);
  const dailyDrawings = [...(dailyDrawingsRemote ?? []), ...dailyDrawingsLocal];

  const [data, setData] = useState<number[]>(blankCanvas);
  const [candidateWords, setCandidateWords] = useState<string[]>([
    getRandomString(Words),
    getRandomString(Words),
    getRandomString(Words),
  ]);
  const [word, setWord] = useState<string>(candidateWords[0]);

  const isSolved = gameData?.postData?.solved ?? false;
  const isAuthor = gameData?.postData?.authorUsername === metadata?.username;

  // How many points has the user earned from this drawing.
  const [pointsEarned, setPointsEarned] = useState<number>(
    metadata?.username ? gameData?.postData?.pointsEarnedByUser || 0 : 0
  );

  // [Start] Countdown Timers
  const [countdownState, setCountdownState] = useState<{
    startTime: number;
    durationMs: number;
    timeLeftMs: number;
    finalRedirect: Page;
  } | null>(null);

  function updateCountdownState(): void {
    if (!countdownState) {
      countdownTimer.stop();
      return;
    }
    const timeLeftMs = countdownState.durationMs - (Date.now() - countdownState.startTime);
    if (timeLeftMs <= 0) {
      const finalRedirect = countdownState.finalRedirect;
      cancelTimer();
      setPage(finalRedirect);
      // this is a hack since we can no longer start the timer inside the render function
      // since we need to also set the state beforehand
      if (finalRedirect === 'editor') {
        startDrawingTimer();
      }
      return;
    }
    setCountdownState({ ...countdownState, timeLeftMs });
  }

  const countdownTimer = useInterval((): void => {
    updateCountdownState();
  }, 1000);

  const startTimer = (durationMs: number, redirectPage: Page): void => {
    setCountdownState({
      startTime: Date.now(),
      durationMs,
      finalRedirect: redirectPage,
      timeLeftMs: durationMs,
    });
    countdownTimer.start();
  };

  const startCardDrawTimer = (): void => startTimer(Settings.cardDrawDuration * 1000, 'editor');
  const startDrawingTimer = (): void => startTimer(Settings.drawingDuration * 1000, 'review');

  const cancelTimer = (): void => {
    setCountdownState(null);
    countdownTimer.stop();
  };

  // [End] Countdown Timer

  function clearData(): void {
    const newWords = [getRandomString(Words), getRandomString(Words), getRandomString(Words)];
    setCandidateWords(newWords);
    setWord(newWords[0]);
    setData(blankCanvas);
    cancelTimer();
  }

  /*
   * Guess feedback timer
   */

  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackDuration, setFeedbackDuration] = useState(Settings.feedbackDuration);
  const guessFeedbackTimer = useInterval(() => {
    if (feedbackDuration > 1) {
      setFeedbackDuration(feedbackDuration - 1);
    } else {
      setShowFeedback(false);
      guessFeedbackTimer.stop();
      setFeedbackDuration(Settings.feedbackDuration);
    }
  }, 100);

  /*
   * Guess validation
   */

  async function onValidateGuess(guess: string): Promise<void> {
    if (!gameData?.postData || !metadata?.username) {
      return;
    }
    const {
      postData: { authorUsername, date, word: correctWord },
    } = gameData;

    const scoreMultiplier = getScoreMultiplier(date);
    const points = Settings.guesserPoints * scoreMultiplier;
    const formattedGuess = guess.toUpperCase();
    if (formattedGuess === correctWord.toUpperCase()) {
      await service
        .handleDrawingSolvedEvent(postId!, authorUsername, metadata.username, date, isSolved)
        .then(async (firstSolver) => {
          setPointsEarned(points);
          setShowFeedback(true);
          guessFeedbackTimer.start();
          if (firstSolver) {
            await reddit.submitComment({
              id: postId!,
              text: `${metadata.username} is the first to solve this drawing!`,
            });
          }
        });
    } else {
      setShowFeedback(true);
      guessFeedbackTimer.start();
      await service.saveIncorrectGuess(guess.toLowerCase());
    }
  }

  let currentPage: JSX.Element;
  switch (page) {
    case 'card-draw':
      currentPage = (
        <CardDrawPage
          candidateWords={candidateWords}
          setPage={setPage}
          setWord={setWord}
          cardDrawCountdown={
            countdownState
              ? Math.round(countdownState.timeLeftMs / 1000)
              : Settings.cardDrawDuration
          }
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
          drawingCountdown={
            countdownState ? Math.round(countdownState.timeLeftMs / 1000) : Settings.drawingDuration
          }
          cancelDrawingTimer={cancelTimer}
          fallbackTimerUpdate={updateCountdownState}
        />
      );
      break;
    case 'info':
      currentPage = <InfoPage onClose={() => setPage(initialPage)} />;
      break;
    case 'leaderboard':
      currentPage = (
        <LeaderboardPage scores={gameData.scores} onClose={() => setPage(initialPage)} />
      );
      break;
    case 'overview':
      currentPage = (
        <OverviewPage
          dailyDrawings={dailyDrawings}
          setPage={setPage}
          startCardDrawTimer={startCardDrawTimer}
          username={metadata.username}
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
          setDailyDrawingsLocal={setDailyDrawingsLocal}
          currentSubreddit={metadata.subreddit}
          username={metadata.username}
          gameSettings={gameData.gameSettings}
          initialPage={initialPage}
        />
      );
      break;
    case 'viewer':
      currentPage = (
        <ViewerPage
          setPage={setPage}
          onValidateGuess={onValidateGuess}
          postData={gameData.postData}
          showFeedback={showFeedback}
          pointsEarned={pointsEarned}
          isSolved={isSolved}
          isAuthor={isAuthor}
          username={metadata.username}
          heroPostId={gameData.gameSettings.heroPostId}
          canDraw={dailyDrawings.length < Settings.dailyDrawingsQuota}
        />
      );
      break;
    default:
      currentPage = (
        <vstack height="100%" width="100%" alignment="center middle">
          <PixelText>Something went wrong</PixelText>
        </vstack>
      );
      break;
  }

  return <PageContainer>{currentPage}</PageContainer>;
};
