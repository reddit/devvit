import { Devvit, useState } from '@devvit/public-api';

import { EditorPageDrawStep } from './EditorPageDrawStep.js';
import { EditorPageReviewStep } from './EditorPageReviewStep.js';
import { EditorPageWordStep } from './EditorPageWordStep.js';

interface EditorPageProps {
  data: {
    username: string | null;
    activeFlairId: string | undefined;
    currentDictionary: string[];
  };
  onCancel: () => void;
}

export const EditorPage = (props: EditorPageProps): JSX.Element => {
  const defaultStep = 'Word';
  const [currentStep, setCurrentStep] = useState<string>(defaultStep);
  const [word, setWord] = useState<string>('');
  const [drawing, setDrawing] = useState<number[]>([]);

  const steps: Record<string, JSX.Element> = {
    Word: (
      <EditorPageWordStep
        {...props}
        onNext={(word) => {
          setWord(word);
          setCurrentStep('Editor');
        }}
        currentDictionary={props.data.currentDictionary}
      />
    ),
    Editor: (
      <EditorPageDrawStep
        {...props}
        word={word}
        onNext={(drawing) => {
          setDrawing(drawing);
          setCurrentStep('Review');
        }}
      />
    ),
    Review: (
      <EditorPageReviewStep
        {...props}
        word={word}
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
