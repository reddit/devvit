import { Devvit, useState } from '@devvit/public-api';

import { EditorPageWordStep } from './EditorPageWordStep.js';
import { EditorPageDrawStep } from './EditorPageDrawStep.js';
import { EditorPageReviewStep } from './EditorPageReviewStep.js';
import type { Dictionary } from '../types/Dictionary.js';
import type { CandidateWord } from '../types/CandidateWord.js';

interface EditorPageProps {
  data: {
    username: string | null;
    activeFlairId: string | undefined;
    dictionaries: Dictionary[];
  };
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
