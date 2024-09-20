import type { Context } from '@devvit/public-api';
import { Devvit, useForm } from '@devvit/public-api';

import { Drawing } from '../../components/Drawing.js';
import { LoadingState } from '../../components/LoadingState.js';
import { PixelText } from '../../components/PixelText.js';
import { StyledButton } from '../../components/StyledButton.js';
import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';

interface DrawTabReviewStepProps {
  data: {
    username: string | null;
    activeFlairId: string | undefined;
  };
  word: string;
  drawing: number[];
  onNext: () => void;
}

export const DrawTabReviewStep = (props: DrawTabReviewStepProps, context: Context): JSX.Element => {
  const service = new Service(context);

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

  async function onPostHandler(): Promise<void> {
    if (props.data.username === null) {
      context.ui.showToast('Please log in to post');
      return;
    }

    const subreddit = await context.reddit.getCurrentSubreddit();

    // The back-end is configured to run this app's submitPost calls as the user
    const post = await context.reddit.submitPost({
      title: 'What is this?',
      subredditName: subreddit.name,
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
        subredditName: subreddit.name,
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
        <StyledButton width="138px" label="POST" onPress={onPostHandler} />
      </hstack>

      <spacer height="24px" />
    </vstack>
  );
};
