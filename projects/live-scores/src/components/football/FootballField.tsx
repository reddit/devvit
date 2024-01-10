import { Devvit } from '@devvit/public-api';
import { NFLGameScoreInfo } from '../../sports/sportradar/NFLBoxscore.js';
import { GameEvent, leagueAssetPath } from '../../sports/GameEvent.js';

enum PossessionSide {
  Left,
  Right,
}

enum PossessionDirection {
  Left,
  Right,
  None,
}

export type FootballFieldProps = {
  info: NFLGameScoreInfo;
};

function Field(division: number): JSX.Element {
  const endzone = division; // NFL size endzone
  const fieldLength = 10 * division; // NFL size field
  return (
    <hstack
      width={'100%'}
      height={'100%'}
      backgroundColor="green"
      alignment="top start"
      borderColor="white"
    >
      <hstack width={endzone} height={'100%'} backgroundColor="red" />
      <hstack width={`${fieldLength}%`} height={'100%'} />
      <hstack width={endzone} height={'100%'} backgroundColor="blue" />
    </hstack>
  );
}

function YardMarkers(division: number): JSX.Element {
  const elements = [];
  for (let i = 0; i <= 10; i++) {
    const yard = (i > 5 ? 10 - i : i) * 10; // yards 10 to 50 back to 10
    const spacer = i * division; // inset position for yard marker
    const textWidth = 2 * division; // center yard marker within 2 field divisions
    elements.push(
      <hstack width={'100%'} height={'100%'} alignment="start middle">
        <spacer width={`${spacer}%`} />
        <zstack width={`${textWidth}%`} height={'100%'} alignment="bottom center">
          <vstack width={'1px'} height={'100%'} backgroundColor="white" />
          {yard > 0 && (
            <vstack width={'100%'} height={'100%'} alignment="bottom center">
              <text size="xsmall" alignment="center">
                {yard}
              </text>
              <spacer size="xsmall" />
            </vstack>
          )}
        </zstack>
      </hstack>
    );
  }
  return <>{elements}</>;
}

function TeamLogos(event: GameEvent): JSX.Element {
  const homeLogo = leagueAssetPath(event) + event.homeTeam.logo;
  const awayLogo = leagueAssetPath(event) + event.awayTeam.logo;
  return (
    <hstack width={'100%'} height={'100%'} alignment="center middle">
      <spacer width="4px" />
      <image imageWidth="16px" imageHeight="16px" url={awayLogo} />
      <spacer size="small" grow />
      <image imageWidth="16px" imageHeight="16px" url={homeLogo} />
      <spacer width="4px" />
    </hstack>
  );
}

function Ball(ballCoordinates: number, direction: PossessionDirection): JSX.Element {
  const ballEmojiOffset = 8;
  const directionRight = direction === PossessionDirection.Right;
  return (
    <hstack width={'100%'} height={'100%'} reverse={directionRight ? true : false}>
      <spacer width={`${ballEmojiOffset}px`} />
      <vstack width={`${ballCoordinates}%`}>
        <spacer size="small" />
        <text size="xlarge" color="yellow" alignment={directionRight ? 'start' : 'end'}>
          {ballText(direction)}
        </text>
      </vstack>
    </hstack>
  );
}

function ballText(direction: PossessionDirection): string {
  switch (direction) {
    case PossessionDirection.Left:
      return '←🏈';
    case PossessionDirection.Right:
      return '🏈→';
    case PossessionDirection.None:
      return '🏈';
  }
}

export function FootballField(props: FootballFieldProps): JSX.Element {
  if (props.info.situation === undefined) {
    return <></>;
  }
  const situation = props.info.situation;
  const summary = props.info.summary;
  const isHome = situation.possession.id === summary.home.id;
  const direction = isHome ? PossessionDirection.Left : PossessionDirection.Right;
  const isInOwnZone = situation.possession.id === situation.location.id;
  const side = isHome
    ? isInOwnZone
      ? PossessionSide.Right
      : PossessionSide.Left
    : isInOwnZone
    ? PossessionSide.Left
    : PossessionSide.Right;

  const ballLocation = situation.location.yardline;

  // `division` is the percentage width of each 10yd section of the field
  // For math, divide the field into 12 equal sections
  // Note - Canadian Football will require adjustments throughout
  const division = 100 / 12;
  const absoluteBallLocation =
    direction === PossessionDirection.Right
      ? side !== PossessionSide.Left
        ? ballLocation
        : ballLocation + 2 * (50 - ballLocation)
      : side === PossessionSide.Left
      ? ballLocation
      : ballLocation + 2 * (50 - ballLocation);

  // convert to 10 zones, and translate to division coordinates + add endzone (CFL will need adjustments)
  const ballCoord = (absoluteBallLocation / 10) * division + division;

  return (
    <hstack width={'100%'} height={'100%'} backgroundColor="pink" alignment="center middle">
      <zstack width={'100%'} height={'100%'} alignment="start middle">
        {Field(division)}
        {YardMarkers(division)}
        {Ball(ballCoord, direction)}
        {TeamLogos(props.info.event)}
      </zstack>
    </hstack>
  );
}
