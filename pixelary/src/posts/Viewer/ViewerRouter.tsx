import { Devvit } from '@devvit/public-api';
import { ViewerPage } from './ViewerPage.js';
import { LeaderboardPage } from '../../components/LeaderboardPage.js';
import { PostData } from '../../types/PostData.js';
import { viewerPages } from './viewerPages.js';
import { LeaderboardEntry } from '../../types/LeaderboardEntry.js';

interface ViewerRouterProps {
  page: string;
  setPage: (page: viewerPages) => void;
  leaderboard: LeaderboardEntry[];
  postData: PostData;
  username: string;
  feedback: boolean;
  setFeedback: (feedback: boolean) => void;
  feedbackDuration: number;
  setFeedbackDuration: (duration: number) => void;
  pointsEarned: number;
  setPointsEarned: (points: number) => void;
  isSolvedByUser: boolean;
  setIsSolvedByUser: (isSolved: boolean) => void;
  isSolved: boolean;
  isAuthor: boolean;
}

export const ViewerRouter = (props: ViewerRouterProps): JSX.Element => {
  const {
    page,
    setPage,
    leaderboard,
    postData,
    username,
    feedback,
    setFeedback,
    feedbackDuration,
    setFeedbackDuration,
    pointsEarned,
    setPointsEarned,
    isSolvedByUser,
    setIsSolvedByUser,
    isSolved,
    isAuthor,
  } = props;

  let currentPage;
  switch (page) {
    case 'default':
      currentPage = (
        <ViewerPage
          setPage={setPage}
          postData={postData}
          username={username}
          feedback={feedback}
          setFeedback={setFeedback}
          feedbackDuration={feedbackDuration}
          setFeedbackDuration={setFeedbackDuration}
          pointsEarned={pointsEarned}
          setPointsEarned={setPointsEarned}
          isSolvedByUser={isSolvedByUser}
          setIsSolvedByUser={setIsSolvedByUser}
          isSolved={isSolved}
          isAuthor={isAuthor}
        />
      );
      break;
    case 'leaderboard':
      currentPage = (
        <LeaderboardPage leaderboard={leaderboard} onClose={() => setPage('default')} />
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
