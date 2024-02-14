import { Devvit, FormKey } from '@devvit/public-api';
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
  showFeedback: boolean;
  pointsEarned: number;
  isSolvedByUser: boolean;
  isSolved: boolean;
  isAuthor: boolean;
  guessForm: FormKey;
}

export const ViewerRouter = (props: ViewerRouterProps): JSX.Element => {
  const {
    page,
    setPage,
    leaderboard,
    postData,
    showFeedback,
    pointsEarned,
    isSolvedByUser,
    isSolved,
    isAuthor,
    guessForm,
  } = props;

  let currentPage;
  switch (page) {
    case 'default':
      currentPage = (
        <ViewerPage
          setPage={setPage}
          postData={postData}
          showFeedback={showFeedback}
          pointsEarned={pointsEarned}
          isSolvedByUser={isSolvedByUser}
          isSolved={isSolved}
          isAuthor={isAuthor}
          guessForm={guessForm}
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
