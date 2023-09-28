import { Devvit } from '@devvit/public-api';
import { EventState } from '../espn.js';
import { Live } from './TopBar.js';

export enum BasketballPossesion {
  HOME = 'HOME',
  AWAY = 'AWAY',
}

export type TopBarBasketball = {
  quarter: string;
  possession: BasketballPossesion;
  timeRemainingInQuarter: string;
};

export type TeamBlockBasketball = {
  fouls: number;
  tol: number;
};

export function topBarBasketballComponent(basketballProps: TopBarBasketball): JSX.Element {
  const { quarter, possession, timeRemainingInQuarter } = basketballProps;

  const leftArrowImageEl = (
    <image
      imageWidth={9}
      imageHeight={10}
      url={possession === BasketballPossesion.AWAY ? 'arrow-full.png' : 'arrow-empty.png'}
    />
  );
  const rightArrowImageEl = (
    <image
      imageWidth={9}
      imageHeight={10}
      url={possession === BasketballPossesion.AWAY ? 'arrow-empty.png' : 'arrow-full.png'}
    />
  );

  return (
    <hstack padding="medium" backgroundColor="black" alignment="center middle">
      <hstack alignment="start" grow>
        <text color="white" style="heading">
          {timeRemainingInQuarter}
        </text>
      </hstack>
      <hstack alignment="center middle" grow>
        {leftArrowImageEl}
        <spacer size="small" />
        <text color="white" style="heading">
          {quarter} Quarter
        </text>
        <spacer size="small" />
        {rightArrowImageEl}
      </hstack>
      <hstack alignment="end" grow>
        {Live()}
      </hstack>
    </hstack>
  );
}

export function sportSpecificContentBasketball(
  _state: EventState,
  isHomeTeam: boolean,
  basketballProps: TeamBlockBasketball
): JSX.Element {
  const { fouls, tol } = basketballProps;

  const foulsEl = (
    <vstack>
      <text color="white" size="small" weight="bold">
        FOULS
      </text>
      <spacer size="xsmall" />
      <vstack
        alignment="middle center"
        padding="small"
        backgroundColor="rgba(0, 0, 0, 0.6)"
        cornerRadius="small"
      >
        <spacer size="small" />
        <text size="large" color="white">
          {fouls}
        </text>
        <spacer size="small" />
      </vstack>
    </vstack>
  );

  const tolEl = (
    <vstack>
      <spacer size="xsmall" />
      <spacer size="small" />
      <text color="white">T.O.L.</text>
      <spacer size="xsmall" />
      <hstack
        alignment="middle center"
        padding="small"
        backgroundColor="rgba(0, 0, 0, 0.6)"
        cornerRadius="small"
      >
        <text size="large" color="white">
          {tol}
        </text>
      </hstack>
    </vstack>
  );

  return (
    <hstack>
      {isHomeTeam ? tolEl : foulsEl}
      <spacer size="medium" />
      {isHomeTeam ? foulsEl : tolEl}
    </hstack>
  );
}
