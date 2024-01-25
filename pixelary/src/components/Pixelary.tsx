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

export const Pixelary: Devvit.CustomPostComponent = (context: Context) => {
  if (!context.postId) {
    throw new Error('No post id found in context');
  }

  const { useState, redis, postId, userId, reddit } = context;
  const service = new Service(redis);

  const [postType] = useState(async () => {
    const heroPostId = await redis.get('#heroPostId');
    if (heroPostId === postId) {
      return PostMode.Editor.toString();
    }
    return PostMode.Viewer.toString();
  });
  const [page, setPage] = useState<editorPages | viewerPages>('default');
  const [data, setData] = useState<number[]>(blankCanvas);
  const randomWord = getRandomString(Words);
  const [word, setWord] = useState<string>(randomWord);
  const [cardDrawCountdown, setCardDrawCountdown] = useState(Settings.cardDrawDuration);
  const [drawingCountdown, setDrawingCountdown] = useState(Settings.drawingDuration);
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

  const [feedback, setFeedback] = useState<boolean>(false);
  const [feedbackDuration, setFeedbackDuration] = useState<number>(2000);

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
          setWord={setWord}
          leaderboard={leaderboard}
          cardDrawCountdown={cardDrawCountdown}
          setCardDrawCountdown={setCardDrawCountdown}
          drawingCountdown={drawingCountdown}
          setDrawingCountdown={setDrawingCountdown}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          dailyDrawings={dailyDrawings}
          setDailyDrawings={setDailyDrawings}
          userPoints={userPoints}
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
          username={username}
          isSolved={isSolved}
          isSolvedByUser={isSolvedByUser}
          setIsSolvedByUser={setIsSolvedByUser}
          pointsEarned={pointsEarned}
          setPointsEarned={setPointsEarned}
          feedback={feedback}
          setFeedback={setFeedback}
          feedbackDuration={feedbackDuration}
          setFeedbackDuration={setFeedbackDuration}
          isAuthor={isAuthor}
        />
      );
      break;
  }

  return currentPost;
};
