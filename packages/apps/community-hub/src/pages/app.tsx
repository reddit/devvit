import type { Context } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { PinPost } from '../api/PinPost.js';
import { AppWrapper } from '../components/AppWrapper.js';
import { adminUserNames } from '../constants.js';
import type { PageProps, Route, RouteParams } from '../types/page.js';
import { AdminPage } from './admin.js';
import { AdminConfigurePage } from './adminConfigure.js';
import { FrequentlyAskedQuestionsPage } from './frequentlyAskedQuestions.js';
import { HomePage } from './home.js';
import { PinDetailPage } from './pinDetail.js';
import { WelcomePage } from './welcome.js';

const getPageForRoute = (route: Route): ((props: PageProps) => JSX.Element) => {
  switch (route) {
    case 'home':
      // to-do: this should not be async.
      // @ts-expect-error
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
  const { useState, postId, reddit } = context;

  if (!postId) {
    throw new Error(`Cannot find post id from context?`);
  }

  const [pinPost, setPinPost] = useState(async () => {
    const svc = new PinPost(postId, context);
    return await svc.getPinPost();
  });

  const [[route, routeParams], setRouteConfig] = useState<[Route, RouteParams]>(async () => {
    if (pinPost.status === 'draft') {
      return ['welcome', {}];
    }

    return ['home', {}];
  });
  const [currentUserUsername] = useState(async () => {
    const user = await reddit.getCurrentUser();
    return user?.username;
  });
  const isOwner = currentUserUsername ? pinPost.owners.includes(currentUserUsername) : false;

  //special feature for RMC to retrieve call subscribers
  let isRMCAdmin = false;
  if (
    currentUserUsername &&
    adminUserNames.includes(currentUserUsername) &&
    context.subredditId === 't5_2fe60r'
  ) {
    isRMCAdmin = true;
  }

  let isRMC = false;

  if (context.subredditId === 't5_2fe60r' || context.subredditId === 't5_apix1y') {
    isRMC = true;
  }

  const navigate = (route: Route, params: RouteParams = {}): void => {
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
    return await svc.clonePost(...args);
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
        currentUserUsername={currentUserUsername ?? ''}
        pinPostMethods={{
          updatePinPost,
          updatePinPostPin,
          clonePost,
        }}
      />
    </AppWrapper>
  );
};
