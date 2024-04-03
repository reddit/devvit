import { Devvit } from '@devvit/public-api';
import { EventState } from '../sports/GameEvent.js';
import type { TeamBlockBaseball } from './baseball.js';
import { sportSpecificContentBaseball } from './baseball.js';
import type { TeamBlockBasketball } from './basketball.js';
import { sportSpecificContentBasketball } from './basketball.js';
import type { TeamBlockSoccer } from './soccer.js';
import { SportSpecificContentSoccer } from './soccer.js';

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
  score?: string;
  state: EventState;
  baseballProps?: TeamBlockBaseball;
  basketballProps?: TeamBlockBasketball;
  soccerProps?: TeamBlockSoccer;
}): JSX.Element {
  let sportSpecificContent;
  let spoilerFree = false;
  if (baseballProps) {
    sportSpecificContent = sportSpecificContentBaseball(state, baseballProps);
  } else if (basketballProps) {
    sportSpecificContent = sportSpecificContentBasketball(state, isHomeTeam, basketballProps);
  } else if (soccerProps) {
    sportSpecificContent = SportSpecificContentSoccer(soccerProps);
    spoilerFree = soccerProps.spoilerFree;
  }
  const onPressAction = soccerProps?.onPressAction;
  return (
    <vstack padding="small" height={'37%'} alignment="start" onPress={onPressAction}>
      <hstack alignment={'start middle'} width={`100%`}>
        <spacer size="small" />
        <image url={logo} imageHeight={32} imageWidth={32} />
        <spacer size="small" />
        {onPressAction ? (
          <hstack alignment="start middle">
            <text size="large" weight="bold" lightColor="AlienBlue-600" darkColor="AlienBlue-400">
              {name}
            </text>
            <spacer size="xsmall" />
            <icon
              name="caret-right"
              size="large"
              lightColor="AlienBlue-600"
              darkColor="AlienBlue-400"
            />
          </hstack>
        ) : null}
        {!onPressAction ? (
          <text size="large" weight="bold">
            {name}
          </text>
        ) : null}
        <spacer grow />
        <text size="xxlarge" weight="bold">
          {state === EventState.PRE ? '-' : spoilerFree ? '?' : score?.toString()}
        </text>
        <spacer size="medium" />
      </hstack>
      <spacer size="small" />
      <hstack>
        <spacer size="small" />
        {(!spoilerFree && sportSpecificContent) ?? null}
      </hstack>
    </vstack>
  );
}
