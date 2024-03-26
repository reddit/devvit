import { Devvit } from '@devvit/public-api';
import { TeamBlock } from './TeamBlock.js';
import { TopBar } from './TopBar.js';
import type { GeneralGameScoreInfo } from '../sports/GameEvent.js';
import { leagueAssetPath } from '../sports/GameEvent.js';
import type { BasketballGameScoreInfo } from '../sports/sportradar/BasketballPlayByPlay.js';

export enum ScoreboardPage {
  SCORE,
  HOME_LINEUP,
  AWAY_LINEUP,
  HOME_STATS,
  HOME_STATS_MORE,
  AWAY_STATS,
  AWAY_STATS_MORE,
}

export type NavigateToPage = (page: ScoreboardPage) => void;

export type ScoreboardProps = {
  scoreInfo: GeneralGameScoreInfo;
  page: ScoreboardPage;
  setPage: NavigateToPage;
};

export function GenericScoreBoard(scoreInfo: GeneralGameScoreInfo): JSX.Element {
  let pbp: string = '';
  if (scoreInfo.event.gameType === 'basketball') {
    const bball = scoreInfo as BasketballGameScoreInfo;
    const lastPeriod = bball.periods?.[bball.periods.length - 1] ?? undefined;
    const lastEvent = lastPeriod?.events[lastPeriod.events.length - 1] ?? undefined;
    pbp = lastEvent ? `${lastEvent.clock} - ${lastEvent.description}` : '';
  }
  return (
    <blocks height="regular">
      <vstack cornerRadius="medium" grow>
        {TopBar({
          event: scoreInfo.event,
          isOnline: true,
        })}
        <zstack grow width={100}>
          <vstack width={'100%'} height={'100%'}>
            {TeamBlock({
              isHomeTeam: false,
              name: scoreInfo.event.awayTeam.fullName,
              logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.awayTeam.logo,
              score: scoreInfo.awayScore,
              state: scoreInfo.event.state,
            })}
            <hstack border="thin" />
            {TeamBlock({
              isHomeTeam: true,
              name: scoreInfo.event.homeTeam.fullName,
              logo: leagueAssetPath(scoreInfo.event) + scoreInfo.event.homeTeam.logo,
              score: scoreInfo.homeScore,
              state: scoreInfo.event.state,
            })}
            <hstack border="thin">
              <text>{pbp}</text>
            </hstack>
          </vstack>
        </zstack>
      </vstack>
    </blocks>
  );
}
