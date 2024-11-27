import type { Context } from '@devvit/public-api';
import { Devvit, useInterval, useState } from '@devvit/public-api';

import { EditorPage } from '../../components/EditorPage.js';
import { Service } from '../../service/Service.js';
import Settings from '../../settings.json';
import type { Dictionary } from '../../types/Dictionary.js';
import { GameSettings } from '../../types/GameSettings.js';
import type { DrawingPostData } from '../../types/PostData.js';
import type { UserData } from '../../types/UserData.js';
import { GuessScreen } from './GuessScreen.js';
import { ResultsScreen } from './ResultsScreen.js';

interface DrawingPostProps {
  postData: DrawingPostData;
  userData: UserData;
  username: string | null;
  gameSettings: GameSettings;
  dictionaries: Dictionary[];
}

export const DrawingPost = (props: DrawingPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const isAuthor = props.postData.authorUsername === props.username;
  const isExpired = props.postData.expired;
  const isSolved = !!props.userData.solved;
  const isSkipped = !!props.userData.skipped;

  const [currentStep, setCurrentStep] = useState<string>(
    isAuthor || isExpired || isSolved || isSkipped ? 'Results' : 'Prompt'
  );

  const [pointsEarned, setPointsEarned] = useState(0);

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
    if (!props.postData || !props.username) {
      return;
    }
    const userGuessedCorrectly = guess.toLowerCase() === props.postData.word.toLowerCase();

    // Give user feedback on their guess
    setFeedback(userGuessedCorrectly);
    timer.start();

    // Submit guess to the server
    const points = await service.submitGuess({
      postData: props.postData,
      username: props.username,
      guess,
      createComment,
    });

    // If user guessed correctly, move to results step
    if (userGuessedCorrectly) {
      setPointsEarned(points);
      setCurrentStep('Results');
    }
  }

  function onSkipHandler(): void {
    setCurrentStep('Results');
  }

  // Steps map
  const steps: Record<string, JSX.Element> = {
    Prompt: (
      <GuessScreen {...props} feedback={feedback} onGuess={onGuessHandler} onSkip={onSkipHandler} />
    ),
    Results: (
      <ResultsScreen
        {...props}
        feedback={feedback}
        pointsEarned={pointsEarned}
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
