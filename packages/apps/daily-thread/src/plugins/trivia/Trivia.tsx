import type { Devvit } from '@devvit/public-api';
import type { BasicTextData } from '../../components/BasicTextComponent.js';
import { BasicTextComponent } from '../../components/BasicTextComponent.js';
import { triviaData } from './TriviaExamples.js';

export type Trivia = BasicTextData;

const triviaStorageKey = 'triviaStorageKey';

export async function initializeTrivia(postId: string, context: Devvit.Context): Promise<void> {
  const { redis } = context;
  const randomIndex = Math.floor(Math.random() * triviaData.length);
  const trivia = {
    title: 'Fun fact of the day',
    description: triviaData[randomIndex],
  };
  await redis.set(`${triviaStorageKey}:${postId}`, JSON.stringify(trivia));
}

export async function getTrivia(context: Devvit.Context): Promise<Trivia | undefined> {
  const { redis, postId } = context;
  if (!postId) {
    return;
  }
  const triviaString = await redis.get(`${triviaStorageKey}:${postId}`);
  if (triviaString) {
    return JSON.parse(triviaString) as Trivia;
  }
}

export type TriviaComponentProps = {
  trivia: Trivia;
};

export const TriviaComponent: Devvit.BlockComponent<TriviaComponentProps> = (
  { trivia },
  context
) => {
  return BasicTextComponent(
    {
      data: trivia,
      iconName: 'wiki',
      iconBgColor: 'Periwinkle-200',
    },
    context
  );
};
