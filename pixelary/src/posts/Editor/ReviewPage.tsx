import { Devvit, Context, FormKey } from '@devvit/public-api';
import { Drawing } from '../../components/Drawing.js';
import { LoadingState } from '../../components/LoadingState.js';
import { PostData } from '../../types/PostData.js';
import Settings from '../../settings.json';
import { DailyDrawingRecord } from '../../types/DailyDrawingRecord.js';
import { StyledButton } from '../../components/StyledButton.js';
import { PixelText } from '../../components/PixelText.js';
import { PixelSymbol } from '../../components/PixelSymbol.js';
import { editorPages } from './editorPages.js';
import { formatNumberWithCommas } from '../../utils/formatNumbers.js';

interface ReviewPageProps {
  word: string;
  setPage: (page: editorPages) => void;
  dailyDrawings: DailyDrawingRecord[];
  setDailyDrawings: (drawings: DailyDrawingRecord[]) => void;
  data: number[];
  clearData: () => void;
  cancelConfirmationForm: FormKey;
  saveDrawing: (drawing: DailyDrawingRecord) => void;
}

export const ReviewPage = (props: ReviewPageProps, context: Context): JSX.Element => {
  const { setPage, clearData, data, word, cancelConfirmationForm, saveDrawing } = props;
  const { reddit, ui, redis, scheduler } = context;

  async function submitDrawing() {
    const currentUser = await reddit.getCurrentUser();
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const activeFlairId = await redis.get('#activeFlairId');

    // BE is configured to run this API call as the user so that the post is submitted by the user
    const post = await reddit.submitPost({
      title: 'What is this?',
      subredditName: currentSubreddit.name,
      preview: <LoadingState />,
    });

    // Apply flair with a separate API call so that it's applied by the app account
    reddit.setPostFlair({
      subredditName: currentSubreddit.name,
      postId: post.id,
      flairTemplateId: activeFlairId,
    });

    const postData: PostData = {
      word,
      data,
      author: currentUser.username,
      authorId: currentUser.id,
      date: new Date(),
    };

    redis.set(`post-${post.id}`, JSON.stringify(postData));

    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + Settings.postLiveSpan);

    scheduler.runJob({
      name: 'PostExpiration',
      data: {
        postId: post.id,
        answer: word,
      },
      runAt: futureDate,
    });

    saveDrawing({
      word,
      data,
      postId: post.id,
    });

    ui.showToast('Submitted post!');
    setPage('default');
    clearData();
  }

  return (
    <vstack width="100%" height="100%" alignment="center middle" padding="large">
      <vstack alignment="center" gap="medium">
        <PixelText scale={3}>Submit drawing?</PixelText>
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
          width="122px"
          label="CANCEL"
          onPress={() => ui.showForm(cancelConfirmationForm)}
        />
        <spacer width="12px" />
        <StyledButton width="122px" label="SUBMIT" onPress={submitDrawing} />
      </hstack>
    </vstack>
  );
};
