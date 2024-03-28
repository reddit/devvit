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
  SETTINGS,
}

export type NavigateToPage = (page: ScoreboardPage) => void;

export enum ScoreboardColor {
  primaryFont = '#F2F4F5',
  secondaryFont = '#B8C5C9',
  offlineFont = '#FFFFFF40',
  liveRed = '#FF4500',
  offline = '#82959B',
  transparentHeader = '#0B1416b3',
  transparentBorder = '#FFFFFF80',
  border = '#485A66',
  reactionBorder = '#8A8D86',
  courtBrown = '#6A3C00',
  greyBackground = '#33464C',
  coolGrey = `#4B6066`,
  onlineGreen = `#55BD46`,
}

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
