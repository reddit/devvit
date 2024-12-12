import { Context, Devvit, useAsync, useState } from '@devvit/public-api';

import { Service } from '../service/Service.js';
import type {
  CandidateWord,
  Dictionary,
  GameSettings,
  PostId,
  UserData,
  UserId,
  WordSelectionEvent,
} from '../types.js';
import { getCandidates } from '../utils.js';
import { EditorPageDrawStep } from './EditorPageDrawStep.js';
import { EditorPageReviewStep } from './EditorPageReviewStep.js';
import { EditorPageWordStep } from './EditorPageWordStep.js';

interface EditorPageProps {
  username: string | null;
  gameSettings: GameSettings;
  dictionaries: Dictionary[];
  userData: UserData | null;
  onCancel: () => void;
}

export const EditorPage = (props: EditorPageProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const defaultStep = 'Word';
  const [currentStep, setCurrentStep] = useState<string>(defaultStep);
  const [drawing, setDrawing] = useState<number[]>([]);
  const [candidate, setCandidate] = useState<CandidateWord | null>(null);
  const [candidates, setCandidates] = useState<CandidateWord[]>(() =>
    getCandidates(props.dictionaries)
  );
  const [wordSelectionEvent, setWordSelectionEvent] = useState<WordSelectionEvent | null>(null);

  // Emit word selection events
  useAsync(
    async () => {
      if (!wordSelectionEvent) return null;
      setWordSelectionEvent(null);
      return await service.emitWordSelectionEvent(wordSelectionEvent);
    },
    {
      depends: [wordSelectionEvent],
    }
  );

  const baseEvent = {
    userId: context.userId as UserId,
    postId: context.postId as PostId,
  };

  const steps: Record<string, JSX.Element> = {
    Word: (
      <EditorPageWordStep
        {...props}
        candidates={candidates}
        onRefreshCandidates={() => {
          setWordSelectionEvent({
            ...baseEvent,
            options: JSON.parse(JSON.stringify(candidates)),
            type: 'refresh',
          });
          const options = getCandidates(props.dictionaries);
          setCandidates(options);
        }}
        onNext={(candidateIndex, selectionEventType) => {
          setWordSelectionEvent({
            ...baseEvent,
            options: JSON.parse(JSON.stringify(candidates)),
            word: candidates[candidateIndex].word,
            type: selectionEventType,
          });
          setCandidate(candidates[candidateIndex]);
          setCurrentStep('Editor');
        }}
      />
    ),
    Editor: (
      <EditorPageDrawStep
        {...props}
        candidate={candidate!}
        onNext={(drawing) => {
          setDrawing(drawing);
          setCurrentStep('Review');
        }}
      />
    ),
    Review: (
      <EditorPageReviewStep
        {...props}
        candidate={candidate!}
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
