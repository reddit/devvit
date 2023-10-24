import { Devvit } from '@devvit/public-api';
import { TeamBlockBaseball, sportSpecificContentBaseball } from './baseball.js';
import { TeamBlockBasketball, sportSpecificContentBasketball } from './basketball.js';
import { EventState } from '../sports/GameEvent.js';
import { TeamBlockSoccer, sportSpecificContentSoccer } from './soccer.js';

export function TeamBlock({
  isHomeTeam,
  name,
  logo,
  score,
  state,
  baseballProps,
  basketballProps,
  soccerProps,
}: {
  isHomeTeam: boolean;
  name: string;
  logo: string;
  score?: number;
  state: EventState;
  baseballProps?: TeamBlockBaseball;
  basketballProps?: TeamBlockBasketball;
  soccerProps?: TeamBlockSoccer;
}): JSX.Element {
  let sportSpecificContent;
  if (baseballProps) {
    sportSpecificContent = sportSpecificContentBaseball(state, baseballProps);
  } else if (basketballProps) {
    sportSpecificContent = sportSpecificContentBasketball(state, isHomeTeam, basketballProps);
  } else if (soccerProps) {
    sportSpecificContent = sportSpecificContentSoccer(soccerProps);
  }

  return (
    <vstack padding="medium" height={'50%'} alignment="start">
      <hstack alignment={'start middle'} width={`100%`}>
        <image url={logo} imageHeight={32} imageWidth={32} />
        <spacer size="small" />
        <text size="large" weight="bold">
          {name}
        </text>
        <spacer grow />
        <text size="xxlarge" weight="bold">
          {state === EventState.PRE ? '-' : score?.toString()}
        </text>
        <spacer size="small" />
      </hstack>
      <spacer size="small" />
      {sportSpecificContent}
    </vstack>
  );
}
