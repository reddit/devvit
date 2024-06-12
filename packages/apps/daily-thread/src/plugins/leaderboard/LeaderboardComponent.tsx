import { Devvit } from '@devvit/public-api';
import type { CommenterScore, LeaderboardStats } from './Leaderboard.js';

export type LeaderboardComponentProps = {
  stats: LeaderboardStats;
};

export const LeaderboardComponent: Devvit.BlockComponent<LeaderboardComponentProps> = ({
  stats,
}) => {
  return (
    <hstack width={'100%'} grow alignment="start middle">
      <vstack height={'100%'} width={'40px'} backgroundColor="#FFE88F" alignment="center top">
        <spacer size="small" />
        <icon name="contest" color="black" />
      </vstack>
      <vstack
        height={'100%'}
        backgroundColor="neutral-background-weak"
        padding="small"
        alignment="start top"
        grow
      >
        <text style="metadata" size="small">
          Today's leaderboard
        </text>
        <spacer size="xsmall" />
        <hstack gap="small" alignment="start top" grow>
          {CommentScoreComponent(stats.topCommentersByCommentCount)}
          {KarmaComponent(stats.topCommentersByKarma)}
        </hstack>
      </vstack>
    </hstack>
  );
};

function CommentScoreComponent(stats: [string, CommenterScore][]): JSX.Element {
  return LeaderboardTable(
    'Comments',
    stats.map(([name, score]) => ({ name, score: score.numberOfComments }))
  );
}

function KarmaComponent(stats: [string, CommenterScore][]): JSX.Element {
  return LeaderboardTable(
    'Karma',
    stats.map(([name, score]) => ({ name, score: score.karma }))
  );
}

function LeaderboardTable(label: string, stats: { name: string; score: number }[]): JSX.Element {
  const displayedStats = [...stats];
  while (displayedStats.length < 3) {
    displayedStats.push({ name: '', score: 0 });
  }
  return (
    <vstack width={`140px`} height={'100%'}>
      <text weight="bold">{label}</text>
      {displayedStats.map(({ name, score }, index) => (
        <hstack
          height="20px"
          backgroundColor={
            index % 2 === 0 ? 'neutral-background-selected' : 'neutral-background-strong'
          }
        >
          <spacer size="xsmall" />
          <text style="metadata" size="small">
            {name}
          </text>
          <spacer grow />
          <text style="metadata" size="small">
            {score > 0 ? score : ''}
          </text>
          <spacer size="xsmall" />
        </hstack>
      ))}
    </vstack>
  );
}
