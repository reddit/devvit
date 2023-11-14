import { Devvit } from '@devvit/public-api';
import { SoccerGameScoreInfo, TimelineEvent } from '../sports/sportradar/SoccerEvent.js';
import { TeamBlock } from './TeamBlock.js';
import { TopBar } from './TopBar.js';
import { Bubble } from './EventBubble.js';

export type TeamBlockSoccer = {
  goals?: TimelineEvent[] | undefined;
  redCards?: TimelineEvent[] | undefined;
};

export function sportSpecificContentSoccer(props: TeamBlockSoccer): JSX.Element {
  const { goals, redCards } = props;

  let goalString: string | undefined;
  if (goals) {
    goalString = generateEventStrings(goals).join(', ');
  }

  let redCardString: string | undefined;
  if (redCards) {
    redCardString = generateEventStrings(redCards).join(', ');
  }

  return (
    <vstack>
      {goalString && (
        <hstack>
          <spacer size="small" />
          <text wrap>⚽︎ {goalString}</text>
        </hstack>
      )}
      {redCardString && (
        <hstack>
          <spacer size="small" />
          <text wrap>🟥 {redCardString}</text>
        </hstack>
      )}
    </vstack>
  );
}

function generateEventStrings(events: TimelineEvent[]): string[] {
  const playerClockMap: { [playerName: string]: string[] } = {};
  // Combine events for each player
  events.forEach((event) => {
    if (event.players && event.players.length > 0 && event.match_time) {
      const player = event.players[0];
      if (!playerClockMap[player.name]) {
        playerClockMap[player.name] = [];
      }
      const clock = event.stoppage_time
        ? `${event.match_time}’+${event.stoppage_time}’`
        : `${event.match_time}’`;
      playerClockMap[player.name].push(clock);
    }
  });

  const result: string[] = [];
  for (let playerName in playerClockMap) {
    const clocks = playerClockMap[playerName];
    result.push(`${playerName.split(',')[0]} (${clocks.join(', ')})`);
  }
  return result;
}

export function SoccerScoreboard(scoreInfo: SoccerGameScoreInfo): JSX.Element {
  return (
    <blocks height="regular">
      <vstack cornerRadius="medium" grow>
        {TopBar({
          state: scoreInfo.event.state,
          date: scoreInfo.event.date,
          event: scoreInfo.event,
        })}
        <zstack grow width={100}>
          <vstack width={'100%'} height={'100%'}>
            {TeamBlock({
              isHomeTeam: true,
              name: scoreInfo.event.homeTeam.fullName,
              logo: scoreInfo.event.homeTeam.logo,
              score: scoreInfo.homeScore,
              state: scoreInfo.event.state,
              soccerProps: {
                goals: scoreInfo.summary?.homeGoals,
                redCards: scoreInfo.summary?.homeRedCards,
              },
            })}
            <hstack border="thin" />
            {TeamBlock({
              isHomeTeam: false,
              name: scoreInfo.event.awayTeam.fullName,
              logo: scoreInfo.event.awayTeam.logo,
              score: scoreInfo.awayScore,
              state: scoreInfo.event.state,
              soccerProps: {
                goals: scoreInfo.summary?.awayGoals,
                redCards: scoreInfo.summary?.awayRedCards,
              },
            })}
            {Bubble(scoreInfo)}
          </vstack>
        </zstack>
      </vstack>
    </blocks>
  );
}
