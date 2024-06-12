import type { Devvit } from '@devvit/public-api';
import type { BasicTextData } from '../../components/BasicTextComponent.js';
import { BasicTextComponent } from '../../components/BasicTextComponent.js';
import { discussionPrompts } from './TopicPromptExamples.js';

export type Topic = BasicTextData;

const topicStorageKey = 'topicPromptKey';

export async function initializeTopic(postId: string, context: Devvit.Context): Promise<void> {
  const { redis } = context;
  const randomIndex = Math.floor(Math.random() * discussionPrompts.length);
  const topic = {
    title: 'Discussion prompt',
    description: discussionPrompts[randomIndex],
  };
  await redis.set(`${topicStorageKey}:${postId}`, JSON.stringify(topic));
}

export async function getTopic(context: Devvit.Context): Promise<Topic | undefined> {
  const { redis, postId } = context;
  if (!postId) {
    return;
  }
  const topicString = await redis.get(`${topicStorageKey}:${postId}`);
  if (topicString) {
    return JSON.parse(topicString) as Topic;
  }
}

export type TopicComponentProps = {
  topic: Topic;
};

export const TopicComponent: Devvit.BlockComponent<TopicComponentProps> = ({ topic }, context) => {
  return BasicTextComponent(
    {
      data: topic,
      iconName: 'chat',
      iconBgColor: 'lightblue',
    },
    context
  );
};
