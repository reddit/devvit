import { Devvit } from '@devvit/public-api';

import type { Reaction, ReactionScore } from '../Reactions.js';
import { friendlyNumber } from '../Reactions.js';
import type { Nullable } from '../utils/types.js';

export type OnReactionPress = (reaction: Reaction) => Promise<void>;

enum Color {
  primaryFont = '#F2F4F5',
  secondaryFont = '#B8C5C9',
  offlineFont = '#FFFFFF40',
  reactionBorder = '#8A8D86',
}

export function ReactionButton(
  reaction: ReactionScore,
  onReactionPress: Nullable<(reaction: Reaction, eventId?: string) => Promise<void>>,
  isOnline: boolean
): JSX.Element {
  return (
    <hstack
      height="32px"
      minWidth="64px"
      border="thin"
      borderColor={Color.reactionBorder}
      cornerRadius="full"
      alignment="center middle"
      onPress={() => onReactionPress?.(reaction.reaction, reaction.eventId)}
    >
      <spacer size="small" />
      <image
        url={reaction.reaction.url}
        height={'24px'}
        width={'24px'}
        imageHeight={48}
        imageWidth={48}
      />
      <spacer size="xsmall" />
      <text
        selectable={false}
        minWidth={'24px'}
        size="small"
        color={isOnline ? Color.primaryFont : Color.offlineFont}
      >
        {friendlyNumber(reaction.count)}
      </text>
      <spacer size="small" />
    </hstack>
  );
}

export function Reactions(
  reactions: ReactionScore[],
  onReactionPress: Nullable<(reaction: Reaction, eventId?: string) => Promise<void>>,
  isOnline: boolean
): JSX.Element {
  return (
    <hstack gap="small" alignment="center middle">
      {reactions.map((r) => (
        <>{ReactionButton(r, onReactionPress, isOnline)}</>
      ))}
    </hstack>
  );
}
