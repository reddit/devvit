import type { Context, FormKey } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';
import { Drawing } from './Drawing.js';
import Settings from '../settings.json';
import type { PostData } from '../types/PostData.js';
import { StyledButton } from './StyledButton.js';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import type { pages } from '../types/pages.js';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';
import { LoadingState } from './LoadingState.js';
import { Service } from '../service/Service.js';
import type { GameSettings } from '../types/GameSettings.js';

interface ReviewPageProps {
  word: string;
  setPage: (page: pages) => void;
  dailyDrawings: PostData[];
  setDailyDrawings: (drawings: PostData[]) => void;
  data: number[];
  clearData: () => void;
  cancelConfirmationForm: FormKey;
  currentSubreddit: string;
  username: string | null;
  gameSettings: GameSettings;
  isHero: boolean;
}

export const ReviewPage = (props: ReviewPageProps, context: Context): JSX.Element => {
  const {
    word,
    setPage,
    data,
    clearData,
    cancelConfirmationForm,
    dailyDrawings,
    setDailyDrawings,
    currentSubreddit,
    username,
    gameSettings,
    isHero,
  } = props;
  const { ui, reddit, redis, scheduler } = context;
  const service = new Service(redis);

  async function submitDrawingHandler(): Promise<void> {
    if (!username) {
      ui.showToast('Please log in to submit a drawing');
      return;
    }

    // The back-end is configured to run this app's submitPost calls as the user
    const post = await reddit.submitPost({
      title: 'What is this?',
      subredditName: currentSubreddit,
      preview: <LoadingState />,
    });

    const postData = {
      word,
      data,
      authorUsername: username,
      date: Date.now(),
      postId: post.id,
      expired: false,
      solved: false,
      published: !!post.id,
    };

    await Promise.all([
      // Post flair is applied with a second API call so that it's applied by the app account (a mod)
      reddit.setPostFlair({
        subredditName: currentSubreddit,
        postId: post.id,
        flairTemplateId: gameSettings.activeFlairId,
      }),
      // Store post data
      service.storePostData(postData),
      // Schedule post expiration
      scheduler.runJob({
        name: 'PostExpiration',
        data: {
          postId: post.id,
          answer: word,
        },
        runAt: new Date(Date.now() + Settings.postLiveSpan),
      }),
      // Store daily drawing
      service.storeDailyDrawing(postData),
    ]);

    // Update the UI
    setDailyDrawings([...dailyDrawings, postData]);
    setPage(isHero ? 'overview' : 'viewer');
    clearData();
    ui.showToast('Drawing submitted');
  }

  return (
    <vstack width="100%" height="100%" alignment="center middle" padding="large">
      <vstack alignment="center" gap="medium">
        <PixelText scale={3}>Submit?</PixelText>
        <hstack gap="small" alignment="center">
          <PixelText>Get</PixelText>
          <PixelSymbol type="star" />
          <PixelText>{`${formatNumberWithCommas(Settings.drawerPoints)} if guessed`}</PixelText>
        </hstack>
      </vstack>

      <spacer size="large" />

      <Drawing data={data} />

      <spacer grow />

      {/* Footer */}
      <hstack alignment="center" width="100%">
        <StyledButton
          width="131px"
          label="CANCEL"
          onPress={() => ui.showForm(cancelConfirmationForm)}
        />
        <spacer size="small" />
        <StyledButton width="131px" label="SUBMIT" onPress={submitDrawingHandler} />
      </hstack>
    </vstack>
  );
};
