import type { Context } from '@devvit/public-api';
import { Devvit, useInterval, useState } from '@devvit/public-api';

import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';
import type { PostData } from '../../types/PostData.js';
import { DrawingPostPromptStep } from './DrawingPostPromptStep.js';
import { DrawingPostResultsStep } from './DrawingPostResultsStep.js';
import { EditorPage } from '../../components/EditorPage.js';

interface DrawingPostProps {
  data: {
    postData: PostData;
    username: string | null;
    activeFlairId: string | undefined;
    currentDictionary: string[];
  };
  refetch: () => void;
}

export const DrawingPost = (props: DrawingPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const isAuthor = props.data.postData.authorUsername === props.data.username;
  const isExpired = props.data.postData.expired;
  const isSolved = props.data.postData.user.solved;
  const isSkipped = props.data.postData.user.skipped;
  const [currentStep, setCurrentStep] = useState<string>(
    isAuthor || isExpired || isSolved || isSkipped ? 'Results' : 'Prompt'
  );

  // Guess feedback
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [feedbackDuration, setFeedbackDuration] = useState(Settings.feedbackDuration);
  const timer = useInterval(() => {
    if (feedbackDuration > 1) {
      setFeedbackDuration(feedbackDuration - 1);
    } else {
      setFeedback(null);
      timer.stop();
      setFeedbackDuration(Settings.feedbackDuration);
    }
  }, 100);

  async function onGuessHandler(guess: string, createComment: boolean): Promise<void> {
    if (!props.data?.postData || !props.data?.username) {
      return;
    }
    const userGuessedCorrectly = guess.toLowerCase() === props.data.postData.word.toLowerCase();

    // Give user feedback on their guess
    setFeedback(userGuessedCorrectly);
    timer.start();

    // If user guessed correctly, move to results step
    if (userGuessedCorrectly) {
      props.refetch();
      setCurrentStep('Results');
    }

    // Submit guess to the server
    await service.handleGuessEvent({
      postData: props.data.postData,
      username: props.data.username,
      guess,
      createComment,
    });
  }

  function onSkipHandler(): void {
    props.refetch();
    setCurrentStep('Results');
  }

  // Steps map
  const steps: Record<string, JSX.Element> = {
    Prompt: (
      <DrawingPostPromptStep
        {...props}
        feedback={feedback}
        onGuess={onGuessHandler}
        onSkip={onSkipHandler}
      />
    ),
    Results: (
      <DrawingPostResultsStep
        {...props}
        feedback={feedback}
        onDraw={() => setCurrentStep('Editor')}
      />
    ),
    Editor: <EditorPage {...props} onCancel={() => setCurrentStep('Results')} />,
  };

  return (
    <vstack width="100%" height="100%">
      {steps[currentStep] || <text>Error: Step not found</text>}
    </vstack>
  );
};
