import { Devvit } from '@devvit/public-api';

import type { GameEvent } from '../../sports/GameEvent.js';
import { leagueAssetPath } from '../../sports/GameEvent.js';
import type { NFLGameScoreInfo } from '../../sports/sportradar/NFLBoxscore.js';

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

function FieldImage(): JSX.Element {
  return (
    <image
      height={'100%'}
      width={'100%'}
      imageWidth={'1292px'}
      imageHeight={'228px'}
      url="football/field.png"
      resizeMode="fill"
    />
  );
}

function _Field(division: number): JSX.Element {
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

function _YardMarkers(division: number): JSX.Element {
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

function TeamLogos(division: number, event: GameEvent): JSX.Element {
  const homeLogo = leagueAssetPath(event) + event.homeTeam.logo;
  const awayLogo = leagueAssetPath(event) + event.awayTeam.logo;
  return (
    <hstack width={'100%'} height={'100%'} alignment="center middle">
      <image
        resizeMode="fit"
        width={`${division}%`}
        imageWidth="240px"
        imageHeight="240px"
        url={awayLogo}
      />
      <spacer size="small" grow />
      <image
        resizeMode="fit"
        width={`${division}%`}
        imageWidth="240px"
        imageHeight="240px"
        url={homeLogo}
      />
    </hstack>
  );
}

function Ball(ballCoordinates: number, direction: PossessionDirection): JSX.Element {
  const url =
    direction === PossessionDirection.Right
      ? 'football/football-right-white.png'
      : 'football/football-left-white.png';
  return (
    <hstack width={'100%'} height={'100%'} alignment="start top">
      <vstack height={'100%'} width={`${ballCoordinates}%`} alignment="end top">
        <spacer size="small" />
        <image width={'48px'} height={'22px'} imageWidth="72px" imageHeight="33px" url={url} />
      </vstack>
    </hstack>
  );
}

function _ballText(direction: PossessionDirection): string {
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
  const absBallLocation =
    side === PossessionSide.Left ? ballLocation + 10 : ballLocation + 2 * (50 - ballLocation) + 10;

  // convert to 10 zones, and translate to division coordinates + add endzone (CFL will need adjustments)
  const ballCoord = (absBallLocation / 10) * division + division;

  return (
    <hstack
      width={'100%'}
      height={'100%'}
      alignment="center middle"
      border="thin"
      borderColor="#B8ECA5"
    >
      <zstack width={'100%'} height={'100%'} alignment="start middle">
        {/* {Field(division)}
        {YardMarkers(division)} */}
        {FieldImage()}
        {Ball(ballCoord, direction)}
        {TeamLogos(division, props.info.event)}
      </zstack>
    </hstack>
  );
}
