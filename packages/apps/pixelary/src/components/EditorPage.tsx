import { Devvit, useState } from '@devvit/public-api';

import type { CandidateWord } from '../types/CandidateWord.js';
import type { Dictionary } from '../types/Dictionary.js';
import { GameSettings } from '../types/GameSettings.js';
import type { UserData } from '../types/UserData.js';
import { EditorPageDrawStep } from './EditorPageDrawStep.js';
import { EditorPageReviewStep } from './EditorPageReviewStep.js';
import { EditorPageWordStep } from './EditorPageWordStep.js';

interface EditorPageProps {
  username: string | null;
  gameSettings: GameSettings;
  dictionaries: Dictionary[];
  userData: UserData;
  onCancel: () => void;
}

export const EditorPage = (props: EditorPageProps): JSX.Element => {
  const defaultStep = 'Word';
  const [currentStep, setCurrentStep] = useState<string>(defaultStep);
  const [candidate, setCandidate] = useState<CandidateWord>({
    dictionaryName: 'main',
    word: '',
  });
  const [drawing, setDrawing] = useState<number[]>([]);

  const steps: Record<string, JSX.Element> = {
    Word: (
      <EditorPageWordStep
        {...props}
        onNext={(selectedCandidate) => {
          setCandidate(selectedCandidate);
          setCurrentStep('Editor');
        }}
      />
    ),
    Editor: (
      <EditorPageDrawStep
        {...props}
        candidate={candidate}
        onNext={(drawing) => {
          setDrawing(drawing);
          setCurrentStep('Review');
        }}
      />
    ),
    Review: (
      <EditorPageReviewStep
        {...props}
        candidate={candidate}
        drawing={drawing}
        onCancel={() => {
          props.onCancel();
        }}
      />
    ),
  };

  return (
    <vstack width="100%" height="100%">
      {steps[currentStep] || <text>Error: Step not found</text>}
    </vstack>
  );
};
