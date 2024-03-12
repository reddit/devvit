import type { Context } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { EditorRouter } from '../posts/Editor/EditorRouter.js';
import { ViewerRouter } from '../posts/Viewer/ViewerRouter.js';
import { PostMode } from '../posts/PostMode.js';
import { Service } from '../service/Service.js';
import Settings from '../settings.json';
import { getRandomString } from '../utils/getRandomString.js';
import Words from '../data/words.json';
import { blankCanvas } from '../utils/blankCanvas.js';
import type { editorPages } from '../posts/Editor/editorPages.js';
import type { viewerPages } from '../posts/Viewer/viewerPages.js';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';
import { getScoreMultiplier } from '../utils/getScoreMultiplier.js';
import type { PostData } from '../types/PostData.js';
import { PixelText } from '../components/PixelText.js';
import type { GameSettings } from '../types/GameSettings.js';
import type { ScoreBoardEntry } from '../types/ScoreBoardEntry.js';

type NavigationPage = editorPages | viewerPages;
type InitialData = {
  gameSettings: GameSettings;
  postData: PostData;
  scores: ScoreBoardEntry[];
};

export const Pixelary: Devvit.CustomPostComponent = (context: Context) => {
  if (!context.postId) {
    throw new Error('No post id found in context');
  }

  const { useState, useInterval, useForm, redis, postId, reddit, ui } = context;
  const service = new Service(redis);

  const getUser = (): Promise<null | string> => {
    if (!context.userId) {
      return Promise.resolve(null);
    }
    return reddit
      .getCurrentUser()
      .then((user) => user.username)
      .catch(() => null);
  };

  const [[currentSubreddit, username]] = useState<[string, string | null]>(async () => {
    return await Promise.all([reddit.getCurrentSubreddit().then((sub) => sub.name), getUser()]);
  });
  const maxLength = 8;

  const [{ gameSettings, postData, scores }] = useState<InitialData>(
    async (): Promise<InitialData> => {
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

      try {
        const [gameSettings = defaultSettings, postData = defaultPostData, scores = []] =
          await Promise.all([
            service.getGameSettings(),
            service.getPostData(postId, username),
            service.getScoreBoard(maxLength),
          ]);

        return {
          gameSettings,
          postData,
          scores,
        };
      } catch (error) {
        console.error('Error loading initial data:', error);

        return {
          gameSettings: defaultSettings,
          postData: defaultPostData,
          scores: [],
        };
      }
    }
  );

  const [dailyDrawings, setDailyDrawings] = useState<PostData[]>(async () => {
    return await service.getDailyDrawings(username);
  });

  const [page, setPage] = useState<NavigationPage>('default');
  const [data, setData] = useState<number[]>(blankCanvas);
  const randomWord = getRandomString(Words);
  const [word, setWord] = useState<string>(randomWord);
  const [currentColor, setCurrentColor] = useState<number>(1);
  const postType =
    gameSettings?.heroPostId === postId ? PostMode.Editor.toString() : PostMode.Viewer.toString();

  const [scoreBoardUser] = useState(async () => await service.getScoreBoardUserEntry(username));
  const isSolved = postData?.solved ?? false;
  const isAuthor = postData?.authorUsername === username;

  // How many points has the user earned from this drawing.
  const [pointsEarned, setPointsEarned] = useState<number>(
    username ? postData?.pointsEarnedByUser || 0 : 0
  );

  // [Start] Countdown Timers
  const [countdownState, setCountdownState] = useState<{
    startTime: number;
    durationMs: number;
    timeLeftMs: number;
    finalRedirect: NavigationPage;
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

  const startTimer = (durationMs: number, redirectPage: NavigationPage): void => {
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
    const randomWord = getRandomString(Words);
    setWord(randomWord.toUpperCase());
    setData(blankCanvas);
    cancelTimer();
  }

  // Cancel drawing confirmation
  const cancelConfirmationForm = useForm(
    {
      title: 'Are you sure?',
      description: `This will exhaust a daily drawing attempt. If you submit the drawing and someone guesses right, you will get ${formatNumberWithCommas(
        Settings.drawerPoints
      )} points.`,
      acceptLabel: 'Discard drawing',
      cancelLabel: 'Back',
      fields: [],
    },
    async () => {
      const postData: PostData = {
        word,
        data,
        authorUsername: username!,
        date: Date.now(),
        published: false,
      };

      await service.storeDailyDrawing(postData);
      setDailyDrawings([...dailyDrawings, postData]);
      setPage('default');
      clearData();
      ui.showToast('Drawing canceled');
    }
  );

  // Guess feedback timer
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

  // Guess validation
  async function validateGuess(guess: string): Promise<void> {
    if (!postData) {
      return;
    }
    const { authorUsername, date, word: correctWord } = postData;
    const scoreMultiplier = getScoreMultiplier(date);
    const points = Settings.guesserPoints * scoreMultiplier;
    const formattedGuess = guess.toUpperCase();
    if (formattedGuess === correctWord.toUpperCase()) {
      await service
        .handleDrawingSolvedEvent(postId!, authorUsername, username!, date, isSolved)
        .then(async (firstSolver) => {
          setPointsEarned(points);
          setShowFeedback(true);
          guessFeedbackTimer.start();
          if (firstSolver) {
            await reddit.submitComment({
              id: postId!,
              text: `${username} is the first to solve this drawing!`,
            });
          }
        })
        .catch((err) => {
          console.log(err);
          ui.showToast('Something went wrong with saving the drawing solved event');
        });
    } else {
      setShowFeedback(true);
      guessFeedbackTimer.start();
      await service.saveIncorrectGuess(guess.toLowerCase());
    }
  }

  // Guess form
  const guessForm = useForm(
    {
      title: 'Guess the word',
      acceptLabel: 'Guess',
      fields: [
        {
          type: 'string',
          name: 'guess',
          label: 'Word',
          helpText: 'A single, case insensitive word',
          required: true,
        },
      ],
    },
    async (values) => {
      const guess = values.guess.trim();
      await validateGuess(guess);
    }
  );

  let currentPost;
  switch (postType) {
    case PostMode.Editor:
      currentPost = (
        <EditorRouter
          page={page}
          setPage={setPage}
          data={data}
          setData={setData}
          word={word}
          scores={scores}
          cardDrawTimeLeft={
            countdownState
              ? Math.round(countdownState.timeLeftMs / 1000)
              : Settings.cardDrawDuration
          }
          setCardDrawTimer={startCardDrawTimer}
          drawingTimeLeft={
            countdownState ? Math.round(countdownState.timeLeftMs / 1000) : Settings.drawingDuration
          }
          cancelDrawingTimer={cancelTimer}
          fallbackTimerUpdate={updateCountdownState}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          dailyDrawings={dailyDrawings}
          setDailyDrawings={setDailyDrawings}
          userPoints={scoreBoardUser.score}
          cancelConfirmationForm={cancelConfirmationForm}
          clearData={clearData}
          currentSubreddit={currentSubreddit}
          username={username}
          gameSettings={gameSettings}
        />
      );
      break;
    case PostMode.Viewer:
      currentPost = (
        <ViewerRouter
          page={page}
          setPage={setPage}
          scores={scores}
          postData={postData}
          isSolved={isSolved}
          pointsEarned={pointsEarned}
          showFeedback={showFeedback}
          isAuthor={isAuthor}
          guessForm={guessForm}
        />
      );
      break;
    default:
      currentPost = (
        <vstack height="100%" width="100%" alignment="center middle">
          <PixelText>Loading ...</PixelText>
        </vstack>
      );
      break;
  }

  return currentPost;
};
