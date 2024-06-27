import type { Devvit } from '@devvit/public-api';
import type { z } from 'zod';
import type { PinPost } from '../api/PinPost.js';
import type { Schema } from '../api/Schema.js';

export type Route =
  | 'welcome'
  | 'home'
  | 'admin'
  | 'admin:configure'
  | 'frequently_asked_questions'
  | 'pin_detail';

export type RouteParams = Record<string, string>;

export type PageProps = {
  context: Devvit.Context;
  route: Route;
  navigate: (route: Route, params?: RouteParams) => void;
  params: RouteParams;

  // Prop drill these things to make it easier to work with and to
  // make the app feel dynamic
  currentUserUsername: string;
  isOwner: boolean;
  isRMCAdmin: boolean;
  isRMC: boolean;
  pinPost: z.infer<(typeof Schema)['pinPostInstance']>;
  pinPostMethods: {
    updatePinPost: PinPost['updatePinPost'];
    updatePinPostPin: PinPost['updatePinPostPin'];
    clonePost: PinPost['clonePost'];
  };
};
