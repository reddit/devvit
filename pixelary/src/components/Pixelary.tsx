import { Context, Devvit } from '@devvit/public-api';
import { EditorRouter } from '../posts/Editor/EditorRouter.js';
import { ViewerRouter } from '../posts/Viewer/ViewerRouter.js';
import { PostMode } from '../posts/PostMode.js';
import { Service } from '../service/Service.js';
import Settings from '../settings.json';
import { DailyDrawingRecord } from '../types/DailyDrawingRecord.js';
import { getRandomString } from '../utils/getRandomString.js';
import Words from '../data/words.json';
import { blankCanvas } from '../utils/blankCanvas.js';
import { editorPages } from '../posts/Editor/editorPages.js';
import { viewerPages } from '../posts/Viewer/viewerPages.js';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';
import { getScoreMultiplier } from '../utils/getScoreMultiplier.js';

type NavigationPage = editorPages | viewerPages;

export const Pixelary: Devvit.CustomPostComponent = (context: Context) => {
  if (!context.postId) {
    throw new Error('No post id found in context');
  }

  const { useState, useInterval, useForm, redis, postId, userId, reddit, ui } = context;
  const service = new Service(redis);

  const [postType] = useState(async () => {
    const heroPostId = await redis.get('#heroPostId');
    if (heroPostId === postId) {
      return PostMode.Editor.toString();
    }
    return PostMode.Viewer.toString();
  });
  const [page, setPage] = useState<NavigationPage>('default');
  const [data, setData] = useState<number[]>(blankCanvas);
  const randomWord = getRandomString(Words);
  const [word, setWord] = useState<string>(randomWord);
  const [currentColor, setCurrentColor] = useState<number>(1);

  const [leaderboard] = useState(async () => {
    const maxLength = 8;
    const truncatedResults = await service.getScoreBoard(maxLength);
    return truncatedResults;
  });

  const [dailyDrawings, setDailyDrawings] = useState<DailyDrawingRecord[]>(async () => {
    const key = service.getDailyDrawingsKey(userId!);
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return Array(3).fill(null);
  });

  const [username] = useState(async () => {
    const user = await reddit.getCurrentUser();
    return user.username;
  });

  const [userPoints] = useState(async () => {
    const service = new Service(redis);
    return await service.getUserPoints(username!);
  });

  const [postData] = useState(async () => {
    const data = await redis.get(`post-${postId}`);
    if (data) {
      return JSON.parse(data);
    }
    return undefined;
  });

  const [isSolved] = useState(async () => {
    return await service.getIsDrawingSolved(postId!);
  });

  const isAuthor = postData?.authorId === userId;

  const [isSolvedByUser, setIsSolvedByUser] = useState(async () => {
    if (isAuthor) {
      return false;
    }
    return await service.getIsDrawingSolvedByUser(postId!, userId!);
  });

  // Todo: Dedupe this from the method above (getIsDrawingSolvedByUser)
  const [pointsEarned, setPointsEarned] = useState(async () => {
    return await service.getPointsEarnedByUser(postId!, userId!);
  });

  // [Start] Countdown Timers
  const [countdownState, setCountdownState] = useState<{
    startTime: number;
    durationMs: number;
    timeLeftMs: number;
    finalRedirect: NavigationPage;
  } | null>(null);

  function updateCountdownState() {
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

  const countdownTimer = useInterval(() => {
    updateCountdownState();
  }, 1000);

  const startTimer = (durationMs: number, redirectPage: NavigationPage) => {
    setCountdownState({
      startTime: Date.now(),
      durationMs,
      finalRedirect: redirectPage,
      timeLeftMs: durationMs,
    });
    countdownTimer.start();
  };

  const startCardDrawTimer = () => startTimer(Settings.cardDrawDuration * 1000, 'editor');
  const startDrawingTimer = () => startTimer(Settings.drawingDuration * 1000, 'review');

  const cancelTimer = () => {
    setCountdownState(null);
    countdownTimer.stop();
  };

  // [End] Countdown Timer

  function clearData() {
    const randomWord = getRandomString(Words);
    setWord(randomWord.toUpperCase());
    setData(blankCanvas);
    cancelTimer();
  }

  function saveDrawing(drawing: DailyDrawingRecord) {
    const key = service.getDailyDrawingsKey(userId!);
    const newDrawings: DailyDrawingRecord[] = dailyDrawings;
    const firstNullIndex = dailyDrawings.findIndex((value) => value === null);

    if (firstNullIndex !== -1) {
      newDrawings[firstNullIndex] = drawing;
    }

    const data = newDrawings.slice(0, 3).concat(Array(3 - newDrawings.length).fill(null));

    setDailyDrawings(data);
    service.storeDrawing(key, data);
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
    () => {
      saveDrawing(false);
      clearData();
      setPage('default');
      ui.showToast('Cancelled drawing');
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
  async function validateGuess(guess: string) {
    const { author, date, authorId, word: correctWord } = postData;
    const scoreMultiplier = getScoreMultiplier(date);
    const points = Settings.guesserPoints * scoreMultiplier;
    const formattedGuess = guess.toUpperCase();
    if (formattedGuess === correctWord.toUpperCase()) {
      await service
        .handleDrawingSolvedEvent(postId!, author!, userId!, username!, date)
        .then(async (firstSolver) => {
          console.log('Drawing solved event handled');
          setIsSolvedByUser(true);
          setPointsEarned(points);
          setShowFeedback(true);
          guessFeedbackTimer.start();
          if (firstSolver) {
            reddit.submitComment({
              id: postId!,
              text: `${username} is the first to solve this drawing!`,
            });

            const authorSettings = await service.getUserSettings(authorId!);
            if (authorSettings.drawingGuessed) {
              const post = await reddit.getPostById(postId!);
              const url = post.permalink;
              reddit.sendPrivateMessage({
                to: author,
                subject: 'Pixelary: Your drawing was solved!',
                text: `[u/${username}](https://reddit.com/u/${username}) just solved your [drawing of "${formattedGuess}"](${url}). You earned ${formatNumberWithCommas(
                  Settings.drawerPoints
                )} points. Great job!`,
              });
            }
          }
        })
        .catch((err) => {
          console.log(err);
          ui.showToast('Something went wrong with saving the drawing solved event');
        });
    } else {
      setShowFeedback(true);
      guessFeedbackTimer.start();
      service.saveIncorrectGuess(guess.toLowerCase());
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
          leaderboard={leaderboard}
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
          userPoints={userPoints}
          cancelConfirmationForm={cancelConfirmationForm}
          clearData={clearData}
          saveDrawing={saveDrawing}
        />
      );
      break;
    case PostMode.Viewer:
      currentPost = (
        <ViewerRouter
          page={page}
          setPage={setPage}
          leaderboard={leaderboard}
          postData={postData}
          isSolved={isSolved}
          isSolvedByUser={isSolvedByUser}
          pointsEarned={pointsEarned}
          showFeedback={showFeedback}
          isAuthor={isAuthor}
          guessForm={guessForm}
        />
      );
      break;
  }

  return currentPost;
};
