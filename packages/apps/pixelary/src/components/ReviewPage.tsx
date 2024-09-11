import type { Context, StateSetter } from '@devvit/public-api';
import { Devvit, useForm } from '@devvit/public-api';
import { Drawing } from './Drawing.js';
import Settings from '../settings.json';
import type { PostData } from '../types/PostData.js';
import { StyledButton } from './StyledButton.js';
import { PixelText } from './PixelText.js';
import { PixelSymbol } from './PixelSymbol.js';
import type { Page } from '../types/Page.js';
import { formatNumberWithCommas } from '../utils/formatNumbers.js';
import { LoadingState } from './LoadingState.js';
import { Service } from '../service/Service.js';
import type { GameSettings } from '../types/GameSettings.js';

interface ReviewPageProps {
  word: string;
  setPage: (page: Page) => void;
  setDailyDrawingsLocal: StateSetter<PostData[]>;
  data: number[];
  clearData: () => void;
  currentSubreddit: string;
  username: string | null;
  gameSettings: GameSettings;
  initialPage: Page;
}

export const ReviewPage = (props: ReviewPageProps, context: Context): JSX.Element => {
  const {
    word,
    setPage,
    data,
    clearData,
    setDailyDrawingsLocal,
    currentSubreddit,
    username,
    gameSettings,
    initialPage,
  } = props;
  const { ui, reddit, redis, scheduler } = context;
  const service = new Service(redis);

  /*
   * Cancel drawing confirmation form
   */

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
      if (!username) {
        return;
      }

      const postData: PostData = {
        word,
        data,
        authorUsername: username,
        date: Date.now(),
        published: false,
      };

      await service.storeDailyDrawing(postData);
      setDailyDrawingsLocal((x) => [...x, postData]);

      setPage('overview');
      clearData();
      ui.showToast('Drawing canceled');
    }
  );

  async function submitDrawingHandler(): Promise<void> {
    if (!username) {
      ui.showToast('Please log in to submit a drawing');
      return;
    }

    const dailyDrawings = await service.getDailyDrawings(username);

    // check if user has slots to submit the drawing
    if (dailyDrawings.length >= Settings.dailyDrawingsQuota) {
      ui.showToast({
        text: 'No drawings left today',
        appearance: 'neutral',
      });
      // Update the UI
      setDailyDrawingsLocal(dailyDrawings);
      setPage(initialPage);
      clearData();
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
    setDailyDrawingsLocal((x) => [...x, postData]);
    setPage(initialPage);
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
