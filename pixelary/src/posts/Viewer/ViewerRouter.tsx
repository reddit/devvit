import type { FormKey } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { ViewerPage } from './ViewerPage.js';
import { LeaderboardPage } from '../../components/LeaderboardPage.js';
import type { PostData } from '../../types/PostData.js';
import type { viewerPages } from './viewerPages.js';
import type { ScoreBoardEntry } from '../../types/ScoreBoardEntry.js';
import { PixelText } from '../../components/PixelText.js';

interface ViewerRouterProps {
  page: string;
  setPage: (page: viewerPages) => void;
  scores: ScoreBoardEntry[];
  postData: PostData | undefined;
  showFeedback: boolean;
  pointsEarned: number;
  isSolved: boolean;
  isAuthor: boolean;
  guessForm: FormKey;
}

export const ViewerRouter = (props: ViewerRouterProps): JSX.Element => {
  const {
    page,
    setPage,
    scores,
    postData,
    showFeedback,
    pointsEarned,
    isSolved,
    isAuthor,
    guessForm,
  } = props;

  if (!postData) {
    return <PixelText>Loading ...</PixelText>;
  }

  const viewerPage = (
    <ViewerPage
      setPage={setPage}
      postData={postData}
      showFeedback={showFeedback}
      pointsEarned={pointsEarned}
      isSolved={isSolved}
      isAuthor={isAuthor}
      guessForm={guessForm}
    />
  );

  let currentPage;
  switch (page) {
    case 'default':
      currentPage = viewerPage;
      break;
    case 'leaderboard':
      currentPage = <LeaderboardPage scores={scores} onClose={() => setPage('default')} />;
      break;
    default:
      currentPage = viewerPage;
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
