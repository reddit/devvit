import type { Context } from '@devvit/public-api';
import { Devvit, useForm } from '@devvit/public-api';

import { GuessScreenSkeleton } from '../posts/DrawingPost/GuessScreenSkeleton.js';
import { Service } from '../service/Service.js';
import Settings from '../settings.json';
import type { CandidateWord } from '../types/CandidateWord.js';
import { GameSettings } from '../types/GameSettings.js';
import { Drawing } from './Drawing.js';
import { PixelText } from './PixelText.js';
import { StyledButton } from './StyledButton.js';

interface EditorPageReviewStepProps {
  username: string | null;
  gameSettings: GameSettings;
  candidate: CandidateWord;
  drawing: number[];
  onCancel: () => void;
}

export const EditorPageReviewStep = (
  props: EditorPageReviewStepProps,
  context: Context
): JSX.Element => {
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
      props.onCancel();
      context.ui.showToast('Drawing canceled');
    }
  );

  async function onPostHandler(): Promise<void> {
    if (!props.username || !props.gameSettings.activeFlairId) {
      context.ui.showToast('Please log in to post');
      return;
    }

    // Add a temporary lock key to prevent duplicate posting.
    // This lock will expire after 10 seconds.
    // If the lock is already set return early.
    const lockKey = `locked:${props.username}`;
    const locked = await context.redis.get(lockKey);
    if (locked === 'true') return;
    const lockoutPeriod = 20000; // 20 seconds
    await context.redis.set(lockKey, 'true', {
      nx: true,
      expiration: new Date(Date.now() + lockoutPeriod),
    });

    // The back-end is configured to run this app's submitPost calls as the user
    const post = await context.reddit.submitPost({
      title: 'What is this?',
      subredditName: props.gameSettings.subredditName,
      preview: (
        <GuessScreenSkeleton
          drawing={props.drawing}
          dictionaryName={props.candidate.dictionaryName}
        />
      ),
    });

    service.submitDrawing({
      postId: post.id,
      word: props.candidate.word,
      dictionaryName: props.candidate.dictionaryName,
      data: props.drawing,
      authorUsername: props.username,
      subreddit: props.gameSettings.subredditName,
      flairId: props.gameSettings.activeFlairId,
    });
    context.ui.navigateTo(post);
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
