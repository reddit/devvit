import { Context, Devvit } from '@devvit/public-api';
import { HomePage } from './home.js';
import { Route, RouteParams } from '../types/page.js';
import { AdminConfigurePage } from './adminConfigure.js';
import { FrequentlyAskedQuestionsPage } from './frequentlyAskedQuestions.js';
import { WelcomePage } from './welcome.js';
import { PinDetailPage } from './pinDetail.js';
import { AdminPage } from './admin.js';
import { adminUserNames } from '../constants.js';
import { PinPost } from '../api/PinPost.js';
import { AppWrapper } from '../components/AppWrapper.js';

const getPageForRoute = (route: Route) => {
  switch (route) {
    case 'home':
      return HomePage;
    case 'admin':
      return AdminPage;
    case 'admin:configure':
      return AdminConfigurePage;
    case 'frequently_asked_questions':
      return FrequentlyAskedQuestionsPage;
    case 'welcome':
      return WelcomePage;
    case 'pin_detail':
      return PinDetailPage;
    default:
      throw new Error(`Unhandled route: ${route satisfies never}`);
  }
};

export const App: Devvit.CustomPostComponent = async (context: Context) => {
  const { useState, postId, userId, reddit } = context;

  if (!postId) {
    throw new Error(`Cannot find post id from context?`);
  }

  const [pinPost, setPinPost] = useState(async () => {
    const svc = new PinPost(postId, context);
    const pinPost = await svc.getPinPost();

    return pinPost;
  });

  const [[route, routeParams], setRouteConfig] = useState<[Route, RouteParams]>(async () => {
    if (pinPost.status === 'draft') {
      return ['welcome', {}];
    }

    return ['home', {}];
  });
  const [currentUserUsername] = useState(async () => {
    const user = await reddit.getCurrentUser();
    return user.username;
  });
  const isOwner = pinPost.owners.includes(currentUserUsername);

  //special feature for RMC to retrieve call subscribers
  let isRMCAdmin = false;
  if (adminUserNames.includes(currentUserUsername) && context.subredditId === 't5_2fe60r') {
    isRMCAdmin = true;
  }

  let isRMC = false;

  if (context.subredditId === 't5_2fe60r' || context.subredditId === 't5_apix1y') {
    isRMC = true;
  }

  const navigate = (route: Route, params: RouteParams = {}) => {
    setRouteConfig([route, params]);
  };

  const updatePinPost: PinPost['updatePinPost'] = async (...args) => {
    const svc = new PinPost(postId, context);
    const data = await svc.updatePinPost(...args);
    setPinPost(data);
    return data;
  };
  const updatePinPostPin: PinPost['updatePinPostPin'] = async (...args) => {
    const svc = new PinPost(postId, context);
    const data = await svc.updatePinPostPin(...args);
    setPinPost(data);
    return data;
  };

  const clonePost: PinPost['clonePost'] = async (...args) => {
    const svc = new PinPost(postId, context);
    const clone = await svc.clonePost(...args);
    return clone;
  };

  const Page = getPageForRoute(route);

  return (
    <AppWrapper borderColor={pinPost.primaryColor} showBorder={pinPost.showBorder}>
      <Page
        navigate={navigate}
        route={route}
        params={routeParams}
        context={context}
        pinPost={pinPost}
        isOwner={isOwner}
        isRMCAdmin={isRMCAdmin}
        isRMC={isRMC}
        currentUserUsername={currentUserUsername}
        pinPostMethods={{
          updatePinPost,
          updatePinPostPin,
          clonePost,
        }}
      />
    </AppWrapper>
  );
};
