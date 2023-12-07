import { Devvit } from '@devvit/public-api';
import { TeamBlockBaseball, sportSpecificContentBaseball } from './baseball.js';
import { TeamBlockBasketball, sportSpecificContentBasketball } from './basketball.js';
import { EventState } from '../sports/GameEvent.js';
import { TeamBlockSoccer, SportSpecificContentSoccer } from './soccer.js';

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
    sportSpecificContent = SportSpecificContentSoccer(soccerProps);
  }
  const onPressAction = soccerProps?.onPressAction;
  return (
    <vstack padding="small" height={'37%'} alignment="start" onPress={onPressAction}>
      <hstack alignment={'start middle'} width={`100%`}>
        <spacer size="small" />
        <image url={logo} imageHeight={32} imageWidth={32} />
        <spacer size="small" />
        {onPressAction && (
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
        )}
        {!onPressAction && (
          <text size="large" weight="bold">
            {name}
          </text>
        )}
        <spacer grow />
        <text size="xxlarge" weight="bold">
          {state === EventState.PRE ? '-' : score?.toString()}
        </text>
        <spacer size="medium" />
      </hstack>
      <spacer size="small" />
      <hstack>
        <spacer size="small" />
        {sportSpecificContent}
      </hstack>
    </vstack>
  );
}
