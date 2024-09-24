import type { Context } from '@devvit/public-api';
import { Devvit, useInterval, useState } from '@devvit/public-api';

import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';
import type { PostData } from '../../types/PostData.js';
import { GuessTabPromptStep } from './GuessTabPromptStep.js';
import { GuessTabResultsStep } from './GuessTabResultsStep.js';

interface GuessTabProps {
  data: {
    postData: PostData;
    username: string | null;
  };
  onDraw: () => void;
  onScores: () => void;
  refresh: () => void;
}

export const GuessTab = (props: GuessTabProps, context: Context): JSX.Element => {
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
      props.refresh();
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
    props.refresh();
    setCurrentStep('Results');
  }

  // Steps map
  const steps: Record<string, JSX.Element> = {
    Prompt: (
      <GuessTabPromptStep
        {...props}
        feedback={feedback}
        onGuess={onGuessHandler}
        onSkip={onSkipHandler}
      />
    ),
    Results: <GuessTabResultsStep {...props} feedback={feedback} onDraw={props.onDraw} />,
  };

  return (
    <vstack width="100%" grow>
      {steps[currentStep] || <text>Error: Step not found in guess tab</text>}
    </vstack>
  );
};
