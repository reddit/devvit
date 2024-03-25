import { Devvit } from '@devvit/public-api';
import type { BasketballScoreboardProps } from './BasketballScoreboard.js';
import { BasketballColor } from './BasketballScoreboard.js';
import type {
  BasketballSummaryPlayer,
  BasketballSummaryTeam,
} from '../../sports/sportradar/BasketballSummary.js';
import { getPlayerStatsForTeam } from '../../sports/sportradar/BasketballSummary.js';
import type { NavigateToPage } from '../Scoreboard.js';
import { ScoreboardPage } from '../Scoreboard.js';
import { leagueAssetPath } from '../../sports/GameEvent.js';
import { NBA_TEAM_COLOR_MAP } from '../../sports/ColorMaps.js';

export function BasketballBoxscore(
  props: BasketballScoreboardProps,
  isHomeTeam: boolean
): JSX.Element {
  if (!props.summary?.home.players || !props.summary?.away.players)
    return (
      <vstack height={'100%'} width={'100%'} alignment="center middle">
        <text color={BasketballColor.primaryFont}>
          Hmm... we don't have any stats for that team yet.
        </text>
        <text color={BasketballColor.primaryFont}>Check back after the game starts!</text>
        <spacer />
        <button onPress={() => props.setPage(ScoreboardPage.SCORE)}>Back to scoreboard</button>
      </vstack>
    );
  const team = isHomeTeam ? props.summary.home : props.summary.away;
  const teamInfo = isHomeTeam ? props.scoreInfo.event.homeTeam : props.scoreInfo.event.awayTeam;
  const logoUrl = leagueAssetPath(props.scoreInfo.event) + teamInfo.logo;
  const players = getPlayerStatsForTeam(team);
  const teamColor = NBA_TEAM_COLOR_MAP[teamInfo.abbreviation.toLowerCase()];
  const displayPlayers =
    props.page === ScoreboardPage.HOME_STATS || props.page === ScoreboardPage.AWAY_STATS
      ? players.slice(0, 7)
      : players.slice(7, 14);
  return (
    <vstack height={'100%'} width={'100%'}>
      {teamHeader(team, logoUrl, teamColor, props.setPage)}
      {statHeaderRow()}
      {displayPlayers.map((player) => playerRow(player))}
      {morePlayersButton(props.page, props.setPage)}
    </vstack>
  );
}

function teamHeader(
  team: BasketballSummaryTeam,
  logoUrl: string,
  teamColor: string,
  closeAction: NavigateToPage
): JSX.Element {
  return (
    <vstack height={`48px`} width={'100%'} backgroundColor={BasketballColor.transparentHeader}>
      <hstack height={'44px'} width={'100%'}>
        <hstack alignment="start middle">
          <spacer size="medium" />
          <image imageWidth="32px" imageHeight="32px" url={logoUrl} />
          <spacer size="small" />
          <text size="xlarge" weight="bold" color={BasketballColor.primaryFont}>
            {`${team.market} ${team.name}`.toLocaleUpperCase()}
          </text>
        </hstack>
        <hstack height={'100%'} grow alignment="end middle">
          <icon
            name="close-outline"
            size="medium"
            color={BasketballColor.primaryFont}
            onPress={() => closeAction(ScoreboardPage.SCORE)}
          />
        </hstack>
        <spacer size="medium" />
      </hstack>
      <hstack height={'4px'} width={'100%'} backgroundColor={teamColor} />
    </vstack>
  );
}

function statCell(val: string, isLarge: boolean = false): JSX.Element {
  const cellWidth = isLarge ? '30%' : '12%';
  return (
    <hstack width={cellWidth} height={'100%'} alignment="end middle">
      <text color={BasketballColor.primaryFont}>{val}</text>
    </hstack>
  );
}

function titleCell(title: string, isPlayer: boolean = true, onCourt: boolean = false): JSX.Element {
  return (
    <hstack grow height={'100%'} alignment="start middle">
      <text color={BasketballColor.primaryFont} weight={isPlayer ? 'regular' : 'bold'}>
        {title}
      </text>
      <spacer size="xsmall" />
      {onCourt ? (
        <text size="xxlarge" color={BasketballColor.onlineGreen}>
          •
        </text>
      ) : null}
    </hstack>
  );
}

function playerRow(player: BasketballSummaryPlayer): JSX.Element {
  const stats = player.statistics;
  return (
    <hstack width={'100%'} height={'28px'}>
      <spacer size="small" />
      {titleCell(`${player.first_name.charAt(0)}. ${player.last_name}`, true, player.on_court)}
      <hstack width={'75%'} height={'100%'} alignment="end">
        {statCell(stats.minutes ? stats.minutes : '0:00', true)}
        {statCell(stats.points ? stats.points.toLocaleString() : '0')}
        {statCell(stats.rebounds ? stats.rebounds.toLocaleString() : '0')}
        {statCell(stats.assists ? stats.assists.toLocaleString() : '0')}
        {statCell(stats.steals ? stats.steals.toLocaleString() : '0')}
        {statCell(stats.blocks ? stats.blocks.toLocaleString() : `0`)}
        <spacer size="small" />
      </hstack>
    </hstack>
  );
}

function statHeaderRow(): JSX.Element {
  return (
    <hstack width={'100%'} height={'32px'} backgroundColor={BasketballColor.coolGrey}>
      <spacer size="small" />
      {titleCell('Player', false)}
      <hstack width={'75%'} height={'100%'} alignment="end">
        {statCell('MIN', true)}
        {statCell('PTS')}
        {statCell('REB')}
        {statCell('AST')}
        {statCell('STL')}
        {statCell('BLK')}
        <spacer size="small" />
      </hstack>
    </hstack>
  );
}

function morePlayersButton(page: ScoreboardPage, onPress: NavigateToPage): JSX.Element {
  const isHomeTeam = page === ScoreboardPage.HOME_STATS_MORE || page === ScoreboardPage.HOME_STATS;
  const isShowingMore =
    page === ScoreboardPage.HOME_STATS_MORE || page === ScoreboardPage.AWAY_STATS_MORE;
  const navigateToPage = isShowingMore
    ? isHomeTeam
      ? ScoreboardPage.HOME_STATS
      : ScoreboardPage.AWAY_STATS
    : isHomeTeam
    ? ScoreboardPage.HOME_STATS_MORE
    : ScoreboardPage.AWAY_STATS_MORE;
  const buttonText = isShowingMore ? 'Back to top' : 'More players';
  const buttonIcon = isShowingMore ? 'up-arrow' : 'down-arrow';

  return (
    <vstack grow width={'100%'} alignment="center bottom">
      <hstack
        height={'28px'}
        width={'132px'}
        alignment="center middle"
        cornerRadius="full"
        backgroundColor={BasketballColor.transparentHeader}
        onPress={() => onPress(navigateToPage)}
      >
        <icon name={buttonIcon} size="small" color={BasketballColor.primaryFont} />
        <spacer size="small" />
        <text color={BasketballColor.primaryFont}>{buttonText}</text>
      </hstack>
      <spacer size="small" />
    </vstack>
  );
}
