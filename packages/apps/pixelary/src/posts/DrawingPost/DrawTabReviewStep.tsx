import type { Context } from '@devvit/public-api';
import { Devvit, useForm } from '@devvit/public-api';
import { Drawing } from '../../components/Drawing.js';
import Settings from '../../settings.json';
import { StyledButton } from '../../components/StyledButton.js';
import { PixelText } from '../../components/PixelText.js';
import { LoadingState } from '../../components/LoadingState.js';
import { Service } from '../../service/Service.js';

interface DrawTabReviewStepProps {
  data: {
    username: string | null;
    subredditName: string;
    activeFlairId: string | undefined;
  };
  word: string;
  drawing: number[];
  onNext: () => void;
}

export const DrawTabReviewStep = (props: DrawTabReviewStepProps, context: Context): JSX.Element => {
  const service = new Service(context.redis);

  /*
   * Cancel drawing confirmation form
   */

  const cancelConfirmationForm = useForm(
    {
      title: 'Are you sure?',
      description:
        "Canceling your drawing means it won't be saved or shared, so no points earned this time. But don't worry, you can create more drawings whenever you like!",
      acceptLabel: 'Cancel Drawing',
      cancelLabel: 'Back',
      fields: [],
    },
    async () => {
      props.onNext();
      context.ui.showToast('Drawing canceled');
    }
  );

  async function submitDrawingHandler(): Promise<void> {
    if (!props.data.username) {
      context.ui.showToast('Please log in to submit a drawing');
      return;
    }

    // The back-end is configured to run this app's submitPost calls as the user
    const post = await context.reddit.submitPost({
      title: 'What is this?',
      subredditName: props.data.subredditName,
      preview: <LoadingState />,
    });

    const postData = {
      word: props.word,
      data: props.drawing,
      authorUsername: props.data.username,
      date: Date.now(),
      postId: post.id,
      expired: false,
      solved: false,
      published: !!post.id,
      count: {
        guesses: 0,
        players: 0,
        winners: 0,
        words: 0,
      },
      user: {
        guesses: 0,
        points: 0,
        solved: false,
      },
      guesses: [],
    };

    await Promise.all([
      // Post flair is applied with a second API call so that it's applied by the app account (a mod)
      context.reddit.setPostFlair({
        subredditName: props.data.subredditName,
        postId: post.id,
        flairTemplateId: props.data.activeFlairId,
      }),
      // Store post data
      service.storePostData(postData),
      // Schedule post expiration
      context.scheduler.runJob({
        name: 'PostExpiration',
        data: {
          postId: post.id,
          answer: props.word,
        },
        runAt: new Date(Date.now() + Settings.postLiveSpan),
      }),
      // Store daily drawing
      service.storeMyDrawing(postData),
    ]);

    props.onNext();
    context.ui.showToast('Drawing submitted');
  }

  return (
    <vstack width="100%" height="100%" alignment="center">
      <spacer height="24px" />

      {/* Title */}
      <PixelText scale={3}>That's a wrap!</PixelText>
      <spacer height="24px" />

      {/* Drawing */}
      <Drawing size={256} data={props.drawing} />
      <spacer height="24px" />

      {/* Body copy */}
      <vstack alignment="center">
        <PixelText color={Settings.theme.secondary}>Post your drawing</PixelText>
        <spacer height="4px" />
        <PixelText color={Settings.theme.secondary}>and earn points for</PixelText>
        <spacer height="4px" />
        <PixelText color={Settings.theme.secondary}>every correct guess!</PixelText>
      </vstack>
      <spacer grow />

      {/* Footer */}
      <hstack alignment="center" width="100%">
        <StyledButton
          width="138px"
          label="CANCEL"
          appearance="secondary"
          onPress={() => context.ui.showForm(cancelConfirmationForm)}
        />
        <spacer size="small" />
        <StyledButton width="138px" label="POST" onPress={submitDrawingHandler} />
      </hstack>

      <spacer height="24px" />
    </vstack>
  );
};
